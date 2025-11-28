import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

/**
 * Supabase Client for Client Components
 * 
 * Use this in:
 * - Client Components (marked with "use client")
 * - Browser-side code
 * - Event handlers, useEffect, etc.
 * 
 * Example:
 * ```tsx
 * "use client"
 * import { createClient } from '@/utils/supabase/client'
 * 
 * export default function MyComponent() {
 *   const supabase = createClient()
 *   // Use supabase client...
 * }
 * ```
 */
export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
