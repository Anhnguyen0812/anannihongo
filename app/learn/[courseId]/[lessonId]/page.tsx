import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import LessonPlayer from '@/components/LessonPlayer'

interface PageProps {
    params: Promise<{
        courseId: string
        lessonId: string
    }>
}

// Helper function to organize lessons by section hierarchy
function organizeLessons(lessons: any[]) {
    const root: Record<string, any> = {}

    lessons.forEach(lesson => {
        const sectionPath = lesson.section || 'Khác'
        const parts = sectionPath.split('>').map((s: string) => s.trim())

        let currentLevel = root

        parts.forEach((part: string, index: number) => {
            if (!currentLevel[part]) {
                currentLevel[part] = {
                    _type: 'folder',
                    _title: part,
                    _children: {},
                    _lessons: []
                }
            }

            if (index === parts.length - 1) {
                currentLevel[part]._lessons.push(lesson)
            } else {
                currentLevel = currentLevel[part]._children
            }
        })
    })

    return root
}

async function getLessonData(courseId: string, lessonId: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirectTo=/learn/' + courseId + '/' + lessonId)
    }

    // Get current lesson
    const { data: currentLesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('course_id', courseId)
        .single()

    if (lessonError || !currentLesson) {
        notFound()
    }

    // Get all lessons in this course
    const { data: allLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('lesson_order', { ascending: true })

    if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError)
    }

    // Get user's progress for all lessons
    const { data: progressData } = await supabase
        .from('progress')
        .select('lesson_id, is_completed, last_watched_at')
        .eq('user_id', user.id)

    // Create a map of lesson progress
    const progressMap = new Map(
        progressData?.map(p => [p.lesson_id, p]) || []
    )

    // Merge progress with lessons
    const lessonsWithProgress = allLessons?.map(lesson => ({
        ...lesson,
        is_completed: progressMap.get(lesson.id)?.is_completed || false,
        last_watched_at: progressMap.get(lesson.id)?.last_watched_at,
    })) || []

    // Get course info
    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

    return {
        currentLesson,
        allLessons: lessonsWithProgress,
        organizedLessons: organizeLessons(lessonsWithProgress),
        course,
        user,
    }
}

export default async function LessonPage({ params }: PageProps) {
    const { courseId, lessonId } = await params
    const data = await getLessonData(courseId, lessonId)

    return (
        <LessonPlayer
            currentLesson={data.currentLesson}
            allLessons={data.allLessons}
            organizedLessons={data.organizedLessons}
            course={data.course}
            user={data.user}
        />
    )
}
