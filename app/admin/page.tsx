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
            <div className="mb-4">
                <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
                <p className="text-sm text-zinc-600">Tổng quan hệ thống AnAn Nihongo</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white rounded-xl p-4 border border-zinc-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-zinc-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-zinc-900 mt-0.5">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-4 border border-zinc-200">
                <h2 className="text-base font-bold text-zinc-900 mb-3">Thao tác nhanh</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link
                        href="/admin/courses"
                        className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-sm"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span className="font-medium">Thêm khóa học</span>
                    </Link>
                    <Link
                        href="/admin/lessons"
                        className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">Thêm bài học</span>
                    </Link>
                    <Link
                        href="/admin/notifications"
                        className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors text-sm"
                    >
                        <Bell className="w-4 h-4" />
                        <span className="font-medium">Gửi thông báo</span>
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-sm"
                    >
                        <Users className="w-4 h-4" />
                        <span className="font-medium">Người dùng</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
