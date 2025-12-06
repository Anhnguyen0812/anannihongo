import { createBrowserClient } from '@supabase/ssr'

/**
 * Untyped Supabase Client for Admin Operations
 * 
 * This client is used for operations on new tables that may not be
 * recognized by the TypeScript compiler until the database tables 
 * are actually created and types are regenerated.
 * 
 * Use this temporarily for admin operations involving:
 * - notifications table
 * - user_notifications table
 */
export function createAdminClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
