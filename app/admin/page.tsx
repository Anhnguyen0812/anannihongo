import { createClient } from '@/utils/supabase/server'
import { BookOpen, FileText, Users, Bell } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch stats
    const [coursesResult, lessonsResult, profilesResult] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ])

    const stats = [
        {
            label: 'Tổng khóa học',
            value: coursesResult.count || 0,
            icon: BookOpen,
            href: '/admin/courses',
            color: 'bg-indigo-100 text-indigo-600',
        },
        {
            label: 'Tổng bài học',
            value: lessonsResult.count || 0,
            icon: FileText,
            href: '/admin/lessons',
            color: 'bg-emerald-100 text-emerald-600',
        },
        {
            label: 'Người dùng',
            value: profilesResult.count || 0,
            icon: Users,
            href: '/admin/users',
            color: 'bg-amber-100 text-amber-600',
        },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
                <p className="text-zinc-600 mt-1">Tổng quan hệ thống AnAn Nihongo</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white rounded-2xl p-6 border border-zinc-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">{stat.label}</p>
                                <p className="text-3xl font-bold text-zinc-900 mt-1">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-4 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200">
                <h2 className="text-xl font-bold text-zinc-900 mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        href="/admin/courses"
                        className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Thêm khóa học</span>
                    </Link>
                    <Link
                        href="/admin/lessons"
                        className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">Thêm bài học</span>
                    </Link>
                    <Link
                        href="/admin/notifications"
                        className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="font-medium">Gửi thông báo</span>
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Quản lý người dùng</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
