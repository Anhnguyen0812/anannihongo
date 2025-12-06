import { useRef, useCallback } from 'react'

/**
 * Throttle hook - limits function calls to once per delay period
 * Use for scroll, resize, or rapid user interactions
 * @param callback - Function to throttle
 * @param delay - Minimum time between calls (ms)
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number = 1000
): T {
    const lastCall = useRef<number>(0)
    const lastArgs = useRef<unknown[]>([])

    return useCallback(
        ((...args: unknown[]) => {
            const now = Date.now()
            lastArgs.current = args

            if (now - lastCall.current >= delay) {
                lastCall.current = now
                return callback(...args)
            }
        }) as T,
        [callback, delay]
    )
}

/**
 * Throttle with trailing call - ensures last call is always executed
 * Good for saving draft, analytics, etc.
 */
export function useThrottleWithTrailing<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number = 1000
): T {
    const lastCall = useRef<number>(0)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    return useCallback(
        ((...args: unknown[]) => {
            const now = Date.now()

            // Clear any pending trailing call
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            if (now - lastCall.current >= delay) {
                // Execute immediately
                lastCall.current = now
                return callback(...args)
            } else {
                // Schedule trailing call
                timeoutRef.current = setTimeout(() => {
                    lastCall.current = Date.now()
                    callback(...args)
                }, delay - (now - lastCall.current))
            }
        }) as T,
        [callback, delay]
    )
}
