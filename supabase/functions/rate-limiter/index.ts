// supabase/functions/rate-limiter/index.ts
// Rate limiting Edge Function using Deno KV

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Rate limit configuration
const RATE_LIMITS: Record<string, { requests: number; windowMs: number }> = {
    // General API: 100 requests per minute
    default: { requests: 100, windowMs: 60 * 1000 },
    // Auth endpoints: stricter limits
    auth: { requests: 30, windowMs: 60 * 60 * 1000 }, // 30/hour
    // Search: 30 requests per minute
    search: { requests: 30, windowMs: 60 * 1000 },
}

// Open Deno KV (persistent storage)
const kv = await Deno.openKv()

interface RateLimitEntry {
    count: number
    resetAt: number
}

async function getRateLimit(key: string): Promise<RateLimitEntry | null> {
    const result = await kv.get<RateLimitEntry>(['rate-limit', key])
    return result.value
}

async function setRateLimit(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void> {
    await kv.set(['rate-limit', key], entry, { expireIn: ttlMs })
}

function getClientIP(request: Request): string {
    // Try various headers for real IP
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    const realIP = request.headers.get('x-real-ip')
    if (realIP) {
        return realIP
    }
    // Fallback
    return 'unknown'
}

function getEndpointType(url: URL): string {
    const path = url.pathname.toLowerCase()
    if (path.includes('/auth/')) return 'auth'
    if (path.includes('/search') || path.includes('?q=')) return 'search'
    return 'default'
}

async function checkRateLimit(
    ip: string,
    endpointType: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const config = RATE_LIMITS[endpointType] || RATE_LIMITS.default
    const key = `${ip}:${endpointType}`
    const now = Date.now()

    let entry = await getRateLimit(key)

    // Initialize or reset if expired
    if (!entry || now >= entry.resetAt) {
        entry = {
            count: 0,
            resetAt: now + config.windowMs,
        }
    }

    // Check limit
    if (entry.count >= config.requests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.resetAt,
        }
    }

    // Increment and save
    entry.count++
    await setRateLimit(key, entry, entry.resetAt - now)

    return {
        allowed: true,
        remaining: config.requests - entry.count,
        resetAt: entry.resetAt,
    }
}

serve(async (req: Request) => {
    const url = new URL(req.url)
    const ip = getClientIP(req)
    const endpointType = getEndpointType(url)

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders })
    }

    // Check rate limit
    const { allowed, remaining, resetAt } = await checkRateLimit(ip, endpointType)

    if (!allowed) {
        const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
        return new Response(
            JSON.stringify({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter,
                limit: RATE_LIMITS[endpointType]?.requests || 100,
                remaining: 0,
            }),
            {
                status: 429,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                    'Retry-After': String(retryAfter),
                    'X-RateLimit-Limit': String(RATE_LIMITS[endpointType]?.requests || 100),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
                },
            }
        )
    }

    // Forward request to target (Supabase API)
    const targetUrl = Deno.env.get('SUPABASE_URL')
    if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // Build forwarded request
    const forwardUrl = new URL(url.pathname + url.search, targetUrl)
    const forwardHeaders = new Headers(req.headers)

    // Add rate limit info to response headers
    const response = await fetch(forwardUrl.toString(), {
        method: req.method,
        headers: forwardHeaders,
        body: req.body,
    })

    // Clone response and add rate limit headers
    const responseHeaders = new Headers(response.headers)
    responseHeaders.set('X-RateLimit-Limit', String(RATE_LIMITS[endpointType]?.requests || 100))
    responseHeaders.set('X-RateLimit-Remaining', String(remaining))
    responseHeaders.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)))

    Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value)
    })

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
    })
})
