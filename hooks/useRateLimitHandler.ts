import { useCallback, useState } from 'react'

interface RateLimitState {
    isLimited: boolean
    retryAfter: number | null
    remaining: number | null
}

/**
 * Hook to handle 429 rate limit errors gracefully
 * Provides state and retry functionality
 */
export function useRateLimitHandler() {
    const [state, setState] = useState<RateLimitState>({
        isLimited: false,
        retryAfter: null,
        remaining: null,
    })

    const handleResponse = useCallback((response: Response) => {
        // Update remaining from headers
        const remaining = response.headers.get('X-RateLimit-Remaining')
        if (remaining) {
            setState((prev) => ({ ...prev, remaining: parseInt(remaining, 10) }))
        }

        // Handle 429
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After')
            const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000

            setState({
                isLimited: true,
                retryAfter: retryMs,
                remaining: 0,
            })

            // Auto-reset after retry period
            setTimeout(() => {
                setState({
                    isLimited: false,
                    retryAfter: null,
                    remaining: null,
                })
            }, retryMs)

            return false // Request failed
        }

        return true // Request succeeded
    }, [])

    const reset = useCallback(() => {
        setState({
            isLimited: false,
            retryAfter: null,
            remaining: null,
        })
    }, [])

    return {
        ...state,
        handleResponse,
        reset,
    }
}

/**
 * Wrapper for fetch that handles rate limiting
 */
export async function fetchWithRateLimit(
    url: string,
    options?: RequestInit
): Promise<Response> {
    const response = await fetch(url, options)

    if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000

        // Wait and retry once
        await new Promise((resolve) => setTimeout(resolve, retryMs))
        return fetch(url, options)
    }

    return response
}
