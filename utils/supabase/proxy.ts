import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
/**
 * Supabase Middleware Client
 * 
 * This function creates a Supabase client for use in Next.js middleware.
 * It handles:
 * - Session refresh
 * - Cookie management
 * - Authentication state
 * 
 * Used in the main middleware.ts file at the root of the project.
 */
export async function updateSession(request: NextRequest) {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Validate environment variables
    const isValidUrl = supabaseUrl &&
        supabaseUrl.startsWith('http') &&
        !supabaseUrl.includes('your-project-url')

    const isValidKey = supabaseAnonKey &&
        supabaseAnonKey.length > 20 &&
        !supabaseAnonKey.includes('your-anon-key')

    // If credentials are not properly configured, skip auth middleware
    if (!isValidUrl || !isValidKey) {
        console.warn('⚠️  Supabase credentials not configured properly.')
        console.warn('📝 Please check your .env.local file:')
        console.warn(`   NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || 'NOT SET'}`)
        console.warn(`   NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'NOT SET'}`)

        // Allow all requests to pass through without auth check
        return NextResponse.next({
            request,
        })
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    // Check if this is a session-only login (no "Remember me")
    const isSessionOnly = request.cookies.get('session-only')?.value === 'true'

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        // If session-only mode, remove maxAge to make cookies expire on browser close
                        const cookieOptions = isSessionOnly
                            ? { ...options, maxAge: undefined, expires: undefined }
                            : options
                        supabaseResponse.cookies.set(name, value, cookieOptions)
                    })
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes that require authentication
    const protectedPaths = ['/learn', '/profile', '/dashboard', '/practice']
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    // If user is not logged in and trying to access protected route
    if (!user && isProtectedPath) {
        // Redirect to login page with return URL
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // If user is logged in and trying to access auth pages (login/signup)
    const authPaths = ['/login', '/signup']
    const isAuthPath = authPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    if (user && isAuthPath) {
        // Redirect to dashboard or home
        const url = request.nextUrl.clone()
        url.pathname = '/learn'
        return NextResponse.redirect(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so: const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so: myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing the cookies!
    // 4. Finally: return myNewResponse
    // If this is not done, you may be causing the browser and server to go out of sync and terminate the user's session prematurely!

    return supabaseResponse
}
