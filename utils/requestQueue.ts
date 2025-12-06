/**
 * Request Queue with Rate Limiting
 * Queues API requests and processes them with delays to avoid 429
 */

type QueuedRequest<T> = {
    execute: () => Promise<T>
    resolve: (value: T) => void
    reject: (error: unknown) => void
}

class RequestQueue {
    private queue: QueuedRequest<unknown>[] = []
    private processing = false
    private minDelay: number
    private lastRequestTime = 0

    constructor(minDelayMs: number = 100) {
        this.minDelay = minDelayMs
    }

    async add<T>(execute: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({
                execute,
                resolve: resolve as (value: unknown) => void,
                reject,
            })
            this.processQueue()
        })
    }

    private async processQueue() {
        if (this.processing || this.queue.length === 0) return

        this.processing = true

        while (this.queue.length > 0) {
            const request = this.queue.shift()!

            // Wait if needed to respect rate limit
            const now = Date.now()
            const timeSinceLastRequest = now - this.lastRequestTime
            if (timeSinceLastRequest < this.minDelay) {
                await this.sleep(this.minDelay - timeSinceLastRequest)
            }

            try {
                this.lastRequestTime = Date.now()
                const result = await request.execute()
                request.resolve(result)
            } catch (error) {
                // Handle 429 specifically
                if (this.is429Error(error)) {
                    const retryAfter = this.getRetryAfter(error)
                    console.warn(`Rate limited. Retrying after ${retryAfter}ms`)
                    await this.sleep(retryAfter)
                    // Re-queue the request
                    this.queue.unshift(request)
                } else {
                    request.reject(error)
                }
            }
        }

        this.processing = false
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    private is429Error(error: unknown): boolean {
        return (
            error instanceof Error &&
            (error.message.includes('429') ||
                error.message.includes('Too Many Requests') ||
                (error as { status?: number }).status === 429)
        )
    }

    private getRetryAfter(error: unknown): number {
        // Try to get Retry-After header value, default to 1 second
        const retryAfter = (error as { headers?: { 'retry-after'?: string } })?.headers?.[
            'retry-after'
        ]
        if (retryAfter) {
            const seconds = parseInt(retryAfter, 10)
            if (!isNaN(seconds)) return seconds * 1000
        }
        return 1000 // Default 1 second
    }

    clear() {
        this.queue = []
    }

    get pending(): number {
        return this.queue.length
    }
}

// Singleton instance for app-wide rate limiting
export const apiQueue = new RequestQueue(100) // 100ms between requests

// Usage example:
// const data = await apiQueue.add(() => supabase.from('lessons').select('*'))
