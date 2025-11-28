/**
 * Supabase Database Types
 * 
 * These types are based on the SQL schema defined in the project.
 * They provide full TypeScript type safety for database operations.
 * 
 * To auto-generate these types from your actual Supabase database:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Link project: supabase link --project-ref your-project-ref
 * 4. Generate types: supabase gen types typescript --local > types/supabase.ts
 * 
 * For now, we're using manually defined types based on the schema.
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string // uuid
                    email: string | null
                    full_name: string | null
                    avatar_url: string | null
                    role: 'admin' | 'student'
                    created_at: string // timestamp
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'admin' | 'student'
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'admin' | 'student'
                    created_at?: string
                }
            }
            courses: {
                Row: {
                    id: number // bigint
                    title: string
                    description: string | null
                    thumbnail_url: string | null
                    slug: string | null
                    price: number // bigint (0 = free)
                    is_published: boolean
                    created_at: string // timestamp
                }
                Insert: {
                    id?: number
                    title: string
                    description?: string | null
                    thumbnail_url?: string | null
                    slug?: string | null
                    price?: number
                    is_published?: boolean
                    created_at?: string
                }
                Update: {
                    id?: number
                    title?: string
                    description?: string | null
                    thumbnail_url?: string | null
                    slug?: string | null
                    price?: number
                    is_published?: boolean
                    created_at?: string
                }
            }
            lessons: {
                Row: {
                    id: number // bigint
                    course_id: number // foreign key to courses
                    title: string
                    drive_file_id: string // Google Drive file ID
                    type: 'video' | 'pdf'
                    lesson_order: number
                    is_free: boolean
                    created_at: string // timestamp
                }
                Insert: {
                    id?: number
                    course_id: number
                    title: string
                    drive_file_id: string
                    type?: 'video' | 'pdf'
                    lesson_order: number
                    is_free?: boolean
                    created_at?: string
                }
                Update: {
                    id?: number
                    course_id?: number
                    title?: string
                    drive_file_id?: string
                    type?: 'video' | 'pdf'
                    lesson_order?: number
                    is_free?: boolean
                    created_at?: string
                }
            }
            progress: {
                Row: {
                    id: number // bigint
                    user_id: string // uuid, foreign key to auth.users
                    lesson_id: number // foreign key to lessons
                    is_completed: boolean
                    last_watched_at: string // timestamp
                }
                Insert: {
                    id?: number
                    user_id: string
                    lesson_id: number
                    is_completed?: boolean
                    last_watched_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    lesson_id?: number
                    is_completed?: boolean
                    last_watched_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Progress = Database['public']['Tables']['progress']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CourseInsert = Database['public']['Tables']['courses']['Insert']
export type LessonInsert = Database['public']['Tables']['lessons']['Insert']
export type ProgressInsert = Database['public']['Tables']['progress']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type CourseUpdate = Database['public']['Tables']['courses']['Update']
export type LessonUpdate = Database['public']['Tables']['lessons']['Update']
export type ProgressUpdate = Database['public']['Tables']['progress']['Update']

// Extended types with relations (for joins)
export type CourseWithLessons = Course & {
    lessons: Lesson[]
}

export type LessonWithProgress = Lesson & {
    progress: Progress | null
}

export type CourseWithLessonsAndProgress = Course & {
    lessons: LessonWithProgress[]
}
