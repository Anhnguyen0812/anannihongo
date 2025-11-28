import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Calendar, Trophy, Clock, BookOpen, LogOut } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@/app/login/actions'

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
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header / Profile Card */}
                <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 -z-10" />

                    <div className="relative">
                        <div className="h-32 w-32 rounded-full border-4 border-background shadow-xl overflow-hidden bg-white">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.full_name || 'User'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                    <User className="h-12 w-12" />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-2 right-2 h-6 w-6 bg-green-500 rounded-full border-2 border-background" />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold">{profile?.full_name || 'Học viên mới'}</h1>
                        <div className="flex flex-col md:flex-row items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Tham gia từ {new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                        <div className="pt-4 flex gap-3 justify-center md:justify-start">
                            <form action={signOut}>
                                <button className="btn-secondary text-sm flex items-center gap-2">
                                    <LogOut className="h-4 w-4" />
                                    Đăng xuất
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Bài học hoàn thành</p>
                            <p className="text-2xl font-bold">{totalCompleted}</p>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Khóa học đang học</p>
                            <p className="text-2xl font-bold">{coursesProgress.size}</p>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Giờ học tích lũy</p>
                            <p className="text-2xl font-bold">{(totalCompleted * 0.5).toFixed(1)}h</p>
                        </div>
                    </div>
                </div>

                {/* Course Progress */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Tiến độ học tập</h2>
                    {coursesProgress.size > 0 ? (
                        Array.from(coursesProgress.entries()).map(([id, data]: [any, any]) => {
                            const percent = Math.round((data.completed / data.total) * 100) || 0
                            return (
                                <Link
                                    href={`/learn/${id}`}
                                    key={id}
                                    className="block glass-card p-6 rounded-2xl hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold">{data.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {data.completed} / {data.total} bài học
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full border-4 border-primary/20 flex items-center justify-center text-sm font-bold">
                                            {percent}%
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-1000"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </Link>
                            )
                        })
                    ) : (
                        <div className="text-center py-12 glass-card rounded-2xl">
                            <p className="text-muted-foreground mb-4">Bạn chưa bắt đầu khóa học nào.</p>
                            <Link href="/learn" className="btn-primary inline-flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Khám phá khóa học
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
