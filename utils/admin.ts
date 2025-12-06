import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Admin Utility Functions
 * 
 * Functions to check and verify admin permissions.
 */

/**
 * Check if the current user has admin role
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role === 'admin'
}

/**
 * Get current user's profile with role
 * @returns Promise<Profile | null>
 */
export async function getCurrentUserProfile() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
}

/**
 * Require admin role - redirects to home if not admin
 * Use this at the top of admin pages
 */
export async function requireAdmin(): Promise<void> {
    const admin = await isAdmin()

    if (!admin) {
        redirect('/learn')
    }
}

/**
 * Get admin status with user info
 * @returns Object with isAdmin and user data
 */
export async function getAdminStatus() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { isAdmin: false, user: null, profile: null }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return {
        isAdmin: profile?.role === 'admin',
        user,
        profile
    }
}
