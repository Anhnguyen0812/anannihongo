import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest } from 'next/server'

/**
 * Next.js Middleware
 * 
 * This middleware runs on every request to:
 * 1. Refresh Supabase auth session
 * 2. Protect routes that require authentication
 * 3. Redirect unauthenticated users to login
 * 4. Redirect authenticated users away from auth pages
 * 
 * Protected routes: /learn, /profile, /dashboard
 * Auth routes: /login, /signup
 */
export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes (optional, remove if you want to protect API routes)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
