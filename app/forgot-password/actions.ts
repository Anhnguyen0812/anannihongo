'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

/**
 * Server Action: Reset Password
 * 
 * Sends a password reset email to the user
 */
export async function resetPassword(formData: FormData) {
    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Vui lòng nhập email' }
    }

    const supabase = await createClient()

    // Get the site URL for redirect
    const headersList = await headers()
    const origin = process.env.NEXT_PUBLIC_SITE_URL
        || headersList.get('origin')
        || headersList.get('x-forwarded-host') && `https://${headersList.get('x-forwarded-host')}`
        || 'http://localhost:3000'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
    })

    if (error) {
        console.error('Reset password error:', error)
        return { error: 'Không thể gửi email. Vui lòng thử lại sau.' }
    }

    return { success: true }
}
