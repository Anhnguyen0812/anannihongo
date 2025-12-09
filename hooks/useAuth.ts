import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/supabase'

const supabase = createClient()

export function useAuth() {
    return useQuery({
        queryKey: ['auth'],
        queryFn: async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                return { user: null, profile: null }
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileError) {
                console.error('Error fetching profile:', profileError)
                return { user, profile: null }
            }

            return { user, profile }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
    })
}
