import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import LessonPlayer from '@/components/LessonPlayer'
import { Lesson, Course, Progress, OrganizedLessons, FolderNode } from '@/types'

interface PageProps {
    params: Promise<{
        courseId: string
        lessonId: string
    }>
}

// Helper function to organize lessons by section hierarchy
function organizeLessons(lessons: Lesson[]): OrganizedLessons {
    const root: OrganizedLessons = {}

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
        redirect(`/login?redirectTo=/learn/${courseId}/${lessonId}`)
    }

    // Parallel fetch for speed
    const [lessonResult, allLessonsResult, progressResult, courseResult] = await Promise.all([
        // Get current lesson
        supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .eq('course_id', courseId)
            .single(),

        // Get all lessons in this course
        supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('lesson_order', { ascending: true }),

        // Get user's progress
        supabase
            .from('progress')
            .select('lesson_id, is_completed')
            .eq('user_id', user.id),

        // Get course info
        supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single(),
    ])

    const { data: currentLesson, error: lessonError } = lessonResult
    const { data: allLessons } = allLessonsResult
    const { data: progressData } = progressResult
    const { data: course } = courseResult

    if (lessonError || !currentLesson) {
        notFound()
    }

    if (!course) {
        notFound()
    }

    // Create map of progress
    const progressMap = new Map<number, Partial<Progress>>(
        (progressData as any)?.map((p: any) => [p.lesson_id, p]) || []
    )

    // Merge progress into lessons
    const lessonsWithProgress: Lesson[] =
        (allLessons as any)?.map((lesson: any) => ({
            ...lesson,
            is_completed: progressMap.get(lesson.id)?.is_completed ?? false,
        })) || []

    return {
        currentLesson: currentLesson as Lesson,
        allLessons: lessonsWithProgress,
        organizedLessons: organizeLessons(lessonsWithProgress),
        course: course as Course,
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
