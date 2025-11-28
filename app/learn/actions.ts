'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: Mark lesson as complete
 * 
 * Inserts or updates progress for a lesson
 */
export async function completeLesson(lessonId: number) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Unauthorized' }
    }

    // Insert or update progress
    const { error } = await supabase
        .from('progress')
        .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            is_completed: true,
            last_watched_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,lesson_id'
        })

    if (error) {
        console.error('Error completing lesson:', error)
        return { error: error.message }
    }

    // Revalidate the learn page
    revalidatePath('/learn/[courseId]/[lessonId]', 'page')

    return { success: true }
}

/**
 * Server Action: Mark lesson as incomplete
 */
export async function uncompleteLesson(lessonId: number) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('progress')
        .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            is_completed: false,
            last_watched_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,lesson_id'
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/learn/[courseId]/[lessonId]', 'page')

    return { success: true }
}
