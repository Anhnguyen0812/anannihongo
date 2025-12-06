import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdminClient } from '@/utils/supabase/admin-client'

const supabase = createAdminClient()

// Fetch all courses
export function useCoursesQuery() {
    return useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('id', { ascending: true })

            if (error) throw error
            return data
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - courses rarely change
    })
}

// Fetch single course with lessons
export function useCourseQuery(courseId: number) {
    return useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('courses')
                .select('*, lessons(*)')
                .eq('id', courseId)
                .single()

            if (error) throw error
            return data
        },
        enabled: !!courseId,
        staleTime: 5 * 60 * 1000,
    })
}

// Fetch single lesson
export function useLessonQuery(lessonId: number) {
    return useQuery({
        queryKey: ['lesson', lessonId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('id', lessonId)
                .single()

            if (error) throw error
            return data
        },
        enabled: !!lessonId,
        staleTime: 5 * 60 * 1000,
    })
}

// Prefetch next lesson
export function usePrefetchLesson() {
    const queryClient = useQueryClient()

    return (lessonId: number) => {
        queryClient.prefetchQuery({
            queryKey: ['lesson', lessonId],
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('lessons')
                    .select('*')
                    .eq('id', lessonId)
                    .single()

                if (error) throw error
                return data
            },
        })
    }
}

// Fetch user progress
export function useUserProgressQuery(userId: string | null, courseId?: number) {
    return useQuery({
        queryKey: ['progress', userId, courseId],
        queryFn: async () => {
            let query = supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId!)

            if (courseId) {
                query = query.eq('course_id', courseId)
            }

            const { data, error } = await query

            if (error) throw error
            return data
        },
        enabled: !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes - progress changes more often
    })
}
