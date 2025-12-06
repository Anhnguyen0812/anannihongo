import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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
