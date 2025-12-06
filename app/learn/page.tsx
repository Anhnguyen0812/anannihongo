import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PlayCircle, BookOpen, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ChatbotWrapper from '@/components/ChatbotWrapper'

export default async function LearnDashboard() {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login?redirectTo=/learn')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get courses
    const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: true })

    // Sắp xếp theo thứ tự N5 -> N4 -> N3 -> N2 -> N1
    const courses = (coursesData || []).sort((a: any, b: any) => {
        const getLevel = (title: string) => {
            const match = title.match(/N(\d)/i)
            if (match) {
                return parseInt(match[1])
            }
            return 0
        }
        return getLevel(b.title) - getLevel(a.title)
    })

    // Get user progress count
    const { count: completedCount } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true)

    return (
        <div className="min-h-screen bg-background">
            <Navbar user={user} profile={profile} />
            
            {/* Header Section */}
            <div className="bg-white border-b border-border/50 shadow-sm">
                <div className="zen-container py-10 md:py-14">
                    <header>
                        <h1 className="text-3xl md:text-4xl font-bold text-heading mb-6">Khóa học của tôi</h1>
                        <div className="flex flex-wrap items-center gap-6 text-text-muted">
                            <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <span className="font-medium">{courses?.length || 0} Khóa học</span>
                            </div>
                            <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
                                <Clock className="h-5 w-5 text-accent" />
                                <span className="font-medium">{completedCount || 0} Bài đã hoàn thành</span>
                            </div>
                        </div>
                    </header>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="zen-container py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(courses as any)?.map((course: any) => (
                        <Link
                            key={course.id}
                            href={`/learn/${course.id}`}
                            className="course-card group"
                        >
                            <div className="aspect-video bg-gradient-to-br from-primary/10 via-indigo-100/50 to-accent/10 flex items-center justify-center overflow-hidden">
                                {course.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="course-card-image w-full h-full object-cover transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <BookOpen className="h-12 w-12 text-primary/40" />
                                        <span className="text-3xl font-bold text-primary/30 jp-text">日本語</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 md:p-8">
                                <h3 className="course-card-title text-xl font-bold text-heading mb-3 transition-colors duration-300">
                                    {course.title}
                                </h3>
                                <p className="text-text-muted line-clamp-2 text-sm mb-6 leading-relaxed">
                                    {course.description || 'Học tiếng Nhật hiệu quả cùng AnAn Nihongo'}
                                </p>

                                <div className="course-card-action flex items-center text-primary font-semibold text-sm transition-transform duration-300">
                                    <PlayCircle className="h-5 w-5 mr-2 fill-primary/20" />
                                    Tiếp tục học
                                    <svg className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {(!courses || courses.length === 0) && (
                        <div className="col-span-full text-center py-20">
                            <div className="bg-white rounded-2xl border border-zinc-200/80 p-16 shadow-sm">
                                <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary/5 mb-6">
                                    <BookOpen className="h-10 w-10 text-primary/40" />
                                </div>
                                <h3 className="text-xl font-bold text-heading mb-3">Chưa có khóa học</h3>
                                <p className="text-text-muted mb-6">Vui lòng quay lại sau để khám phá các khóa học mới.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ChatbotWrapper screenContext="Trang danh sách khóa học - Người dùng đang xem các khóa học có sẵn" />
        </div>
    )
}
