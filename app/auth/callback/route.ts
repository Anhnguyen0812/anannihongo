import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * OAuth Callback Route Handler
 * 
 * This route handles the callback from Google OAuth.
 * It exchanges the code for a session and creates/updates the user profile.
 * 
 * Flow:
 * 1. User clicks "Login with Google" → redirected to Google
 * 2. User authorizes → Google redirects back here with code
 * 3. We exchange code for session
 * 4. Create/update user profile in database
 * 5. Redirect to /learn or original destination
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/learn'

    if (code) {
        const supabase = await createClient()

        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Error exchanging code for session:', error)
            return NextResponse.redirect(`${origin}/login?error=auth_failed`)
        }

        if (data.user) {
            // Check if profile exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', data.user.id)
                .single()

            // Create profile if it doesn't exist
            if (!existingProfile) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    // @ts-ignore
                    .insert({
                        id: data.user.id,
                        email: data.user.email,
                        full_name: data.user.user_metadata.full_name || data.user.user_metadata.name,
                        avatar_url: data.user.user_metadata.avatar_url || data.user.user_metadata.picture,
                        role: 'user',
                    })

                if (profileError) {
                    console.error('Error creating profile:', profileError)
                    // Continue anyway - profile can be created later
                }
            } else {
                // Update profile with latest info from Google
                await supabase
                    .from('profiles')
                    // @ts-ignore
                    .update({
                        email: data.user.email,
                        full_name: data.user.user_metadata.full_name || data.user.user_metadata.name,
                        avatar_url: data.user.user_metadata.avatar_url || data.user.user_metadata.picture,
                    })
                    .eq('id', data.user.id)
            }
        }

        // Redirect to a client-side handler to process rememberMe preference
        // The handler will check localStorage and set appropriate cookies
        return NextResponse.redirect(`${origin}/auth/callback/complete?redirectTo=${encodeURIComponent(redirectTo)}`)
    }

    // If no code, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=no_code`)
}
