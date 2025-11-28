import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

/**
 * Supabase Client for Server Components
 * 
 * Use this in:
 * - Server Components (default in App Router)
 * - Server Actions
 * - Route Handlers (API routes)
 * 
 * This client properly handles cookies for authentication.
 * 
 * Example:
 * ```tsx
 * import { createClient } from '@/utils/supabase/server'
 * 
 * export default async function MyServerComponent() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('courses').select('*')
 *   // Use data...
 * }
 * ```
 */
export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
