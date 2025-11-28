'use server'
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

/**
 * Server Action: Sign up with Email & Password
 * 
 * Creates a new user account with email and password
 */
export async function signUpWithEmail(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!email || !password) {
        redirect('/login?error=missing_credentials')
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (error) {
        console.error('Sign up error:', error)
        redirect(`/login?error=${error.message}`)
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
        redirect('/login?message=check_email')
    }

    // If auto-confirmed, redirect to learn
    redirect('/learn')
}

/**
 * Server Action: Login with Email & Password
 * 
 * Authenticates user with email and password
 */
export async function loginWithEmail(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        redirect('/login?error=missing_credentials')
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        redirect(`/login?error=${error.message}`)
    }

    redirect('/learn')
}

/**
 * Server Action: Login with Google OAuth
 * 
 * This action initiates the Google OAuth flow.
 * User will be redirected to Google login, then back to /auth/callback
 */
export async function loginWithGoogle() {
    const supabase = await createClient()
    const origin = (await headers()).get('origin') || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) {
        console.error('Google OAuth error:', error)
        redirect('/login?error=oauth_failed')
    }

    if (data.url) {
        redirect(data.url) // Redirect to Google OAuth page
    }
}

/**
 * Server Action: Sign Out
 * 
 * Logs out the current user and redirects to home page
 */
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}
