import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// ============ RATE LIMITING ============
// In-memory rate limit store (resets on server restart)
// For production, use Redis or Deno KV
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT = {
    maxRequests: 10, // 10 requests
    windowMs: 60 * 1000, // per 1 minute
}

function getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for')
    if (forwarded) return forwarded.split(',')[0].trim()
    const realIP = req.headers.get('x-real-ip')
    if (realIP) return realIP
    return 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now()
    const entry = rateLimitStore.get(ip)

    // Initialize or reset expired entry
    if (!entry || now >= entry.resetAt) {
        rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs })
        return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1, resetIn: RATE_LIMIT.windowMs }
    }

    // Check if over limit
    if (entry.count >= RATE_LIMIT.maxRequests) {
        return { allowed: false, remaining: 0, resetIn: entry.resetAt - now }
    }

    // Increment and allow
    entry.count++
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - entry.count, resetIn: entry.resetAt - now }
}

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
        if (now >= value.resetAt) {
            rateLimitStore.delete(key)
        }
    }
}, 5 * 60 * 1000)
// ============ END RATE LIMITING ============

// System prompt chi tiết cho trợ lý học tiếng Nhật
const SYSTEM_PROMPT = `Bạn là AnAn - trợ lý AI thông minh của website AnAn Nihongo, chuyên hỗ trợ học tiếng Nhật.

## Vai trò của bạn:
- Giải đáp thắc mắc về tiếng Nhật (ngữ pháp, từ vựng, Kanji, Hiragana, Katakana)
- Hỗ trợ người dùng hiểu bài học đang xem (context bài học sẽ được cung cấp trong [])
- Đưa ra ví dụ thực tế và dễ hiểu
- Khuyến khích và tạo động lực học tập

## Quy tắc trả lời:
1. **Ngôn ngữ**: Trả lời bằng tiếng Việt, dễ hiểu
2. **Định dạng**: Sử dụng Markdown (bold, italic, bullet points, bảng)
3. **Kanji**: Luôn kèm phiên âm Hiragana trong ngoặc và nghĩa tiếng Việt
   Ví dụ: 勉強 (べんきょう - học tập)
4. **Ngắn gọn**: Trả lời súc tích, đi thẳng vào vấn đề
5. **Ví dụ**: Đưa ví dụ câu tiếng Nhật khi giải thích ngữ pháp

## Khi người dùng hỏi về bài học:
- Tham khảo context trong [] để biết họ đang học gì
- Giải thích liên quan đến nội dung bài học đó
- Có thể gợi ý link bài học nếu được cung cấp

## Phong cách:
- Thân thiện, nhiệt tình như một gia sư
- Sử dụng emoji phù hợp 📚✨🎌
- Khen ngợi khi người dùng hỏi hay hoặc tiến bộ`

export async function POST(req: NextRequest) {
    // Check rate limit first
    const clientIP = getClientIP(req)
    const { allowed, remaining, resetIn } = checkRateLimit(clientIP)

    if (!allowed) {
        const retryAfter = Math.ceil(resetIn / 1000)
        return new Response(
            JSON.stringify({
                error: 'Bạn đang gửi quá nhiều tin nhắn. Vui lòng chờ một phút.',
                code: 'RATE_LIMIT',
                retryAfter,
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(retryAfter),
                    'X-RateLimit-Limit': String(RATE_LIMIT.maxRequests),
                    'X-RateLimit-Remaining': '0',
                },
            }
        )
    }

    try {
        const { messages, screenContext } = await req.json()

        if (!process.env.GEMINI_API_KEY) {
            return new Response(
                JSON.stringify({ error: 'GEMINI_API_KEY chưa được cấu hình' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT,
        })

        // Giới hạn history chỉ lấy 4 tin nhắn gần nhất (2 cặp hỏi-đáp)
        const recentMessages = messages.slice(-5) // 4 tin cũ + 1 tin mới
        let history = recentMessages.slice(0, -1).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content.slice(0, 500) }], // Giới hạn mỗi tin 500 ký tự
        }))

        // Đảm bảo history bắt đầu với role 'user', nếu không thì bỏ qua phần đầu
        if (history.length > 0 && history[0].role !== 'user') {
            history = history.slice(1)
        }

        // Get the latest user message
        const latestMessage = messages[messages.length - 1].content

        // Add screen context if available (giới hạn 150 ký tự)
        let contextualPrompt = latestMessage.slice(0, 500) // Giới hạn câu hỏi 500 ký tự
        if (screenContext && screenContext.length > 0) {
            const shortContext = screenContext.slice(0, 350)
            contextualPrompt = `[${shortContext}]\n${contextualPrompt}`
        }

        const chat = model.startChat({
            history: history.length > 0 ? history : undefined,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            },
        })

        // Use streaming
        const result = await chat.sendMessageStream(contextualPrompt)

        // Create a readable stream for the response
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text()
                        if (text) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                        }
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                    controller.close()
                } catch (error) {
                    controller.error(error)
                }
            },
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    } catch (error: any) {
        console.error('Chat API Error:', error)

        // Handle rate limit error specifically
        if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
            return new Response(
                JSON.stringify({
                    error: 'Hệ thống đang quá tải. Vui lòng thử lại sau 1 phút.',
                    code: 'RATE_LIMIT'
                }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ error: error.message || 'Có lỗi xảy ra' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
