export interface Course {
    id: string
    title: string
    description?: string
    thumbnail_url?: string
    created_at: string
}

export interface Lesson {
    id: number
    course_id: string
    title: string
    description?: string
    video_url?: string
    drive_file_id?: string
    duration?: number
    lesson_order: number
    section?: string
    created_at: string
    is_completed?: boolean
    last_watched_at?: string | null
}

export interface Progress {
    user_id: string
    lesson_id: number
    is_completed: boolean
    last_watched_at: string
}

export interface FolderNode {
    _type: 'folder'
    _title: string
    _children: Record<string, FolderNode>
    _lessons: Lesson[]
}

export type OrganizedLessons = Record<string, FolderNode>
