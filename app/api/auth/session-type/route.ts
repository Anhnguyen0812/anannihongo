import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * API Route: Set Session Type
 * 
 * Sets whether the session should be "session-only" (expires when browser closes)
 * or persistent (default Supabase behavior - 7 days)
 */
export async function POST(request: Request) {
    try {
        const { sessionOnly } = await request.json()
        const cookieStore = await cookies()

        if (sessionOnly) {
            // Mark this as a session-only login (expires when browser closes)
            cookieStore.set('session-only', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                // No maxAge = session cookie (expires when browser closes)
            })
        } else {
            // Clear the session-only marker
            cookieStore.delete('session-only')
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error setting session type:', error)
        return NextResponse.json({ error: 'Failed to set session type' }, { status: 500 })
    }
}
