import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Lesson, OrganizedLessons, FolderNode } from '@/types'

interface PageProps {
    params: Promise<{
        courseId: string
    }>
}

// Helper function to organize lessons by section hierarchy (same as in [lessonId]/page.tsx)
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

// Get first lesson based on tree structure (same logic as LessonPlayer)
function getFirstLessonFromTree(organized: OrganizedLessons): Lesson | null {
    const sortedFolders = Object.entries(organized).sort(([a], [b]) =>
        a.localeCompare(b, 'vi', { numeric: true })
    )

    for (const [_, content] of sortedFolders) {
        // 1. First, check lessons in current folder
        if (content._lessons && content._lessons.length > 0) {
            const sorted = [...content._lessons].sort((a, b) =>
                a.title.localeCompare(b.title, 'vi', { numeric: true })
            )
            return sorted[0]
        }

        // 2. Then, recursively check sub-folders
        if (content._children && Object.keys(content._children).length > 0) {
            const firstFromChildren = getFirstLessonFromTree(content._children)
            if (firstFromChildren) {
                return firstFromChildren
            }
        }
    }

    return null
}

export default async function CoursePage({ params }: PageProps) {
    const { courseId } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect(`/login?redirectTo=/learn/${courseId}`)
    }

    // 1. Try to find the last watched lesson in this course
    const { data: progressList } = await supabase
        .from('progress')
        .select('lesson_id, lessons!inner(id, course_id)')
        .eq('user_id', user.id)
        .eq('lessons.course_id', courseId)
        .order('last_watched_at', { ascending: false })
        .limit(1)

    if (progressList && progressList.length > 0) {
        redirect(`/learn/${courseId}/${(progressList[0] as any).lesson_id}`)
    }

    // 2. If no progress, find the first lesson based on tree structure
    const { data: allLessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)

    if (allLessons && allLessons.length > 0) {
        const organized = organizeLessons(allLessons as Lesson[])
        const firstLesson = getFirstLessonFromTree(organized)
        
        if (firstLesson) {
            redirect(`/learn/${courseId}/${firstLesson.id}`)
        }
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
