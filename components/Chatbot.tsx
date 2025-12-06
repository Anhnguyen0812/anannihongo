"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Sparkles, Minimize2, Maximize2, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface StoredMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

interface ChatbotProps {
    screenContext?: string
}

const STORAGE_KEY = 'anan-chat-history'
const WELCOME_MESSAGE: Message = {
    id: '1',
    role: 'assistant',
    content: 'Xin chào! 👋 Mình là **AnAn**, trợ lý học tiếng Nhật của bạn. Bạn có thể hỏi mình về:\n\n- 📚 Ngữ pháp, từ vựng, Kanji\n- 🎯 Bài học bạn đang xem\n- 🌸 Văn hóa Nhật Bản\n\nHãy hỏi mình bất cứ điều gì nhé!',
    timestamp: new Date(),
}

export default function Chatbot({ screenContext }: ChatbotProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
    const [isInitialized, setIsInitialized] = useState(false)
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [streamingContent, setStreamingContent] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Load chat history from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed: StoredMessage[] = JSON.parse(stored)
                const restored: Message[] = parsed.map(m => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }))
                if (restored.length > 0) {
                    setMessages(restored)
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error)
        }
        setIsInitialized(true)
    }, [])

    // Save chat history to localStorage whenever messages change
    useEffect(() => {
        if (!isInitialized) return // Don't save during initial load
        try {
            const toStore: StoredMessage[] = messages.map(m => ({
                ...m,
                timestamp: m.timestamp.toISOString()
            }))
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
        } catch (error) {
            console.error('Error saving chat history:', error)
        }
    }, [messages, isInitialized])

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, streamingContent, scrollToBottom])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)
        setStreamingContent('')

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    screenContext,
                }),
            })

            if (!response.ok) {
                // Try to get error message from response
                let errorMsg = 'Có lỗi xảy ra. Vui lòng thử lại!'
                try {
                    const errorData = await response.json()
                    if (errorData.code === 'RATE_LIMIT') {
                        errorMsg = '⏳ Hệ thống đang quá tải. Vui lòng chờ 1 phút rồi thử lại nhé!'
                    } else if (errorData.error) {
                        errorMsg = errorData.error
                    }
                } catch {
                    // Ignore JSON parse error
                }
                
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `❌ ${errorMsg}`,
                    timestamp: new Date(),
                }
                setMessages(prev => [...prev, errorMessage])
                setIsLoading(false)
                return
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let fullContent = ''

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value)
                    const lines = chunk.split('\n')

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6)
                            if (data === '[DONE]') continue

                            try {
                                const parsed = JSON.parse(data)
                                if (parsed.text) {
                                    fullContent += parsed.text
                                    setStreamingContent(fullContent)
                                }
                            } catch {
                                // Skip invalid JSON
                            }
                        }
                    }
                }
            }

            // Add the complete assistant message
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fullContent || 'Xin lỗi, mình không thể trả lời được. Vui lòng thử lại!',
                timestamp: new Date(),
            }

            setMessages(prev => [...prev, assistantMessage])
            setStreamingContent('')
        } catch (error) {
            console.error('Chat error:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '❌ Không thể kết nối. Vui lòng kiểm tra mạng và thử lại!',
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const clearChat = () => {
        const newWelcome: Message = {
            ...WELCOME_MESSAGE,
            id: Date.now().toString(),
            timestamp: new Date(),
        }
        setMessages([newWelcome])
        // Clear localStorage when user explicitly clears chat
        localStorage.removeItem(STORAGE_KEY)
    }

    return (
        <>
            {/* Chat Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-white text-zinc-600 shadow-lg border border-zinc-200 hover:shadow-xl transition-all flex items-center justify-center"
                    >
                        <MessageCircle className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            height: isMinimized ? 'auto' : '80vh'
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] max-h-[85vh] bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-zinc-100">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-zinc-500" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-zinc-800 text-sm">AnAn</h3>
                                    <p className="text-[10px] text-zinc-400">Trợ lý tiếng Nhật</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <button
                                    onClick={clearChat}
                                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                                    title="Xóa cuộc trò chuyện"
                                >
                                    <Trash2 className="h-4 w-4 text-zinc-400" />
                                </button>
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                                >
                                    {isMinimized ? (
                                        <Maximize2 className="h-4 w-4 text-zinc-400" />
                                    ) : (
                                        <Minimize2 className="h-4 w-4 text-zinc-400" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                                >
                                    <X className="h-4 w-4 text-zinc-400" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                                message.role === 'user' 
                                                    ? 'bg-zinc-100' 
                                                    : 'bg-zinc-100'
                                            }`}>
                                                {message.role === 'user' ? (
                                                    <User className="h-4 w-4 text-zinc-500" />
                                                ) : (
                                                    <Bot className="h-4 w-4 text-zinc-500" />
                                                )}
                                            </div>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                                message.role === 'user'
                                                    ? 'bg-zinc-100 text-zinc-700'
                                                    : 'bg-zinc-50 border border-zinc-100'
                                            }`}>
                                                <div className={`text-sm leading-relaxed ${
                                                    message.role === 'user' ? 'text-zinc-700' : 'text-zinc-600'
                                                }`}>
                                                    {message.role === 'assistant' ? (
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                table: ({ children }) => (
                                                                    <div className="overflow-x-auto my-2">
                                                                        <table className="min-w-full text-xs border-collapse">
                                                                            {children}
                                                                        </table>
                                                                    </div>
                                                                ),
                                                                thead: ({ children }) => (
                                                                    <thead className="bg-zinc-100">{children}</thead>
                                                                ),
                                                                th: ({ children }) => (
                                                                    <th className="border border-zinc-300 px-2 py-1 text-left font-semibold">
                                                                        {children}
                                                                    </th>
                                                                ),
                                                                td: ({ children }) => (
                                                                    <td className="border border-zinc-200 px-2 py-1">{children}</td>
                                                                ),
                                                                strong: ({ children }) => (
                                                                    <strong className="font-semibold text-zinc-900">{children}</strong>
                                                                ),
                                                                em: ({ children }) => (
                                                                    <em className="italic">{children}</em>
                                                                ),
                                                                code: ({ children, className }) => {
                                                                    const isInline = !className
                                                                    return isInline ? (
                                                                        <code className="bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded text-xs font-mono">
                                                                            {children}
                                                                        </code>
                                                                    ) : (
                                                                        <code className="block bg-zinc-800 text-zinc-100 p-2 rounded text-xs font-mono overflow-x-auto my-2">
                                                                            {children}
                                                                        </code>
                                                                    )
                                                                },
                                                                ul: ({ children }) => (
                                                                    <ul className="list-disc list-inside space-y-0.5 my-1.5">{children}</ul>
                                                                ),
                                                                ol: ({ children }) => (
                                                                    <ol className="list-decimal list-inside space-y-0.5 my-1.5">{children}</ol>
                                                                ),
                                                                li: ({ children }) => (
                                                                    <li className="text-sm">{children}</li>
                                                                ),
                                                                p: ({ children }) => (
                                                                    <p className="mb-1.5 last:mb-0">{children}</p>
                                                                ),
                                                                h1: ({ children }) => (
                                                                    <h1 className="text-base font-semibold mb-1.5">{children}</h1>
                                                                ),
                                                                h2: ({ children }) => (
                                                                    <h2 className="text-sm font-semibold mb-1">{children}</h2>
                                                                ),
                                                                h3: ({ children }) => (
                                                                    <h3 className="text-sm font-medium mb-1">{children}</h3>
                                                                ),
                                                                blockquote: ({ children }) => (
                                                                    <blockquote className="border-l-2 border-zinc-300 pl-2 text-zinc-600 my-1.5">
                                                                        {children}
                                                                    </blockquote>
                                                                ),
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    ) : (
                                                        message.content
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Streaming message */}
                                    {streamingContent && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-2.5"
                                        >
                                            <div className="shrink-0 h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-zinc-500" />
                                            </div>
                                            <div className="max-w-[80%] rounded-2xl px-4 py-2.5 bg-zinc-50 border border-zinc-100">
                                                <div className="text-sm leading-relaxed text-zinc-600">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {streamingContent}
                                                    </ReactMarkdown>
                                                    <span className="inline-block w-1.5 h-4 bg-zinc-300 animate-pulse ml-0.5 rounded-sm" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Loading indicator */}
                                    {isLoading && !streamingContent && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-2.5"
                                        >
                                            <div className="shrink-0 h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-zinc-500" />
                                            </div>
                                            <div className="rounded-2xl px-4 py-3 bg-zinc-50 border border-zinc-100">
                                                <div className="flex gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="h-2 w-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="h-2 w-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-3 bg-white border-t border-zinc-100 shrink-0">
                                    <div className="flex gap-2 items-end">
                                        <textarea
                                            ref={inputRef}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Nhập câu hỏi..."
                                            rows={1}
                                            className="flex-1 resize-none rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-300 placeholder:text-zinc-400 max-h-28 bg-white"
                                            style={{ minHeight: '44px' }}
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!input.trim() || isLoading}
                                            className="h-[44px] w-[44px] rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
