import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

interface PageProps {
    params: Promise<{
        courseId: string
    }>
}

export default async function CoursePage({ params }: PageProps) {
    const { courseId } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect(`/login?redirectTo=/learn/${courseId}`)
    }

    // 1. Try to find the last watched lesson
    const { data: lastProgress } = await supabase
        .from('progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false })
        .limit(1)
        .single()

    if (lastProgress) {
        // Check if this lesson belongs to the current course
        const { data: lesson } = await supabase
            .from('lessons')
            .select('id')
            .eq('id', (lastProgress as any).lesson_id)
            .eq('course_id', courseId)
            .single()

        if (lesson) {
            redirect(`/learn/${courseId}/${(lesson as any).id}`)
        }
    }

    // 2. If no progress, find the first lesson of the course
    const { data: firstLesson } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId)
        .order('lesson_order', { ascending: true })
        .limit(1)
        .single()

    if (firstLesson) {
        redirect(`/learn/${courseId}/${(firstLesson as any).id}`)
    }

    // 3. If no lessons found
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Khóa học chưa có bài học</h1>
                <p className="text-muted-foreground">Vui lòng quay lại sau.</p>
            </div>
        </div>
    )
}
