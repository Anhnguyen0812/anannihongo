import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PlayCircle, BookOpen, Clock } from 'lucide-react'

export default async function LearnDashboard() {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login?redirectTo=/learn')
    }

    // Get courses
    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

    // Get user progress count
    const { count: completedCount } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true)

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Khóa học của tôi</h1>
                    <div className="flex items-center gap-6 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            <span>{courses?.length || 0} Khóa học</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            <span>{completedCount || 0} Bài đã hoàn thành</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses?.map((course) => (
                        <Link
                            key={course.id}
                            href={`/learn/${course.id}`}
                            className="group relative overflow-hidden rounded-2xl glass-card hover:border-primary/50 transition-all duration-300"
                        >
                            <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                {course.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-primary/40 jp-text">日本語</span>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-muted-foreground line-clamp-2 text-sm mb-4">
                                    {course.description || 'Học tiếng Nhật hiệu quả cùng Nihongo Master'}
                                </p>

                                <div className="flex items-center text-primary font-medium text-sm">
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Tiếp tục học
                                </div>
                            </div>
                        </Link>
                    ))}

                    {(!courses || courses.length === 0) && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            Chưa có khóa học nào. Vui lòng quay lại sau.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
