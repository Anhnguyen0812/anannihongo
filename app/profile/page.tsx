import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Calendar, Trophy, Clock, BookOpen, Target } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ChatbotWrapper from '@/components/ChatbotWrapper'

export default async function ProfilePage() {
    const supabase = await createClient()

    // 1. Get User & Profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // 2. Get Progress Stats
    const { data: progress } = await supabase
        .from('progress')
        .select('*, lessons(*, courses(id, title))')
        .eq('user_id', user.id)
        .eq('is_completed', true)

    // Calculate stats
    const totalCompleted = progress?.length || 0
    const coursesProgress = new Map()

    progress?.forEach((p: any) => {
        const courseId = p.lessons?.courses?.id
        const courseTitle = p.lessons?.courses?.title

        if (courseId) {
            if (!coursesProgress.has(courseId)) {
                coursesProgress.set(courseId, {
                    title: courseTitle,
                    completed: 0,
                    total: 0 // We need to fetch total lessons count separately or estimate
                })
            }
            coursesProgress.get(courseId).completed++
        }
    })

    // Get total lessons count per course to calculate percentage
    const { data: courses } = await supabase
        .from('courses')
        .select('id, title, lessons(count)')

    courses?.forEach((c: any) => {
        if (coursesProgress.has(c.id)) {
            coursesProgress.get(c.id).total = c.lessons[0].count
        }
    })

    return (
        <div className="min-h-screen bg-background">
            <Navbar user={user} profile={profile} />
            
            {/* Profile Header with gradient background */}
            <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b border-zinc-200">
                <div className="zen-container py-12 md:py-16">
                    {/* Header / Profile Card */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm border border-zinc-200">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-zinc-100">
                                {(profile as any)?.avatar_url ? (
                                    <img
                                        src={(profile as any).avatar_url}
                                        alt={(profile as any).full_name || 'User'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                        <User className="h-10 w-10" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white" />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2">{(profile as any)?.full_name || 'Học viên mới'}</h1>
                            <div className="flex flex-col md:flex-row items-center gap-3 text-zinc-500 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                </div>
                                <span className="hidden md:inline text-zinc-300">•</span>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <span>Tham gia từ {new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                            <div className="mt-3">
                                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                    {(profile as any)?.role === 'admin' ? '👑 Admin' : '📚 Học viên'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats & Progress Section */}
            <div className="zen-container py-10 md:py-14 space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-zinc-200 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 mb-0.5">Bài học hoàn thành</p>
                            <p className="text-2xl font-bold text-zinc-900">{totalCompleted}</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-zinc-200 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 mb-0.5">Khóa học đang học</p>
                            <p className="text-2xl font-bold text-zinc-900">{coursesProgress.size}</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-zinc-200 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 mb-0.5">Giờ học tích lũy</p>
                            <p className="text-2xl font-bold text-zinc-900">{(totalCompleted * 0.5).toFixed(1)}h</p>
                        </div>
                    </div>
                </div>

                {/* Course Progress */}
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Target className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900">Tiến độ học tập</h2>
                    </div>
                    {coursesProgress.size > 0 ? (
                        <div className="space-y-3">
                        {Array.from(coursesProgress.entries()).map(([id, data]: [any, any]) => {
                            const percent = Math.round((data.completed / data.total) * 100) || 0
                            return (
                                <Link
                                    href={`/learn/${id}`}
                                    key={id}
                                    className="block bg-white p-5 rounded-xl border border-zinc-200 hover:border-primary/40 hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-base font-semibold text-zinc-900 group-hover:text-primary transition-colors">{data.title}</h3>
                                            <p className="text-sm text-zinc-500">
                                                {data.completed} / {data.total} bài học
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary bg-primary/5 group-hover:border-primary/40 transition-all">
                                            {percent}%
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </Link>
                            )
                        })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-zinc-100 mb-4">
                                <BookOpen className="h-8 w-8 text-zinc-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Chưa có tiến độ</h3>
                            <p className="text-zinc-500 mb-5">Bạn chưa bắt đầu khóa học nào.</p>
                            <Link href="/learn" className="btn-primary inline-flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Khám phá khóa học
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <ChatbotWrapper screenContext="Trang hồ sơ cá nhân - Người dùng đang xem thông tin và tiến độ học tập" />
        </div>
    )
}