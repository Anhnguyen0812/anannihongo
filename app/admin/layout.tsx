import { requireAdmin, getAdminStatus } from '@/utils/admin'
import Link from 'next/link'
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Bell,
    Users,
    ArrowLeft,
    Settings
} from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Check admin access
    await requireAdmin()

    const { profile } = await getAdminStatus()

    const navItems = [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/admin/courses', icon: BookOpen, label: 'Khóa học' },
        { href: '/admin/lessons', icon: FileText, label: 'Bài học' },
        { href: '/admin/notifications', icon: Bell, label: 'Thông báo' },
        { href: '/admin/users', icon: Users, label: 'Người dùng' },
    ]

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            {/* Sidebar */}
            <aside className="w-56 bg-white border-r border-zinc-200 fixed h-full">
                <div className="p-4 border-b border-zinc-200">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-600" />
                        <h1 className="text-lg font-bold text-zinc-900">Admin</h1>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(profile as any)?.full_name || 'Admin'}
                    </p>
                </div>

                <nav className="p-2">
                    <ul className="space-y-0.5">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-zinc-200">
                    <Link
                        href="/learn"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4" style={{ marginLeft: '14rem' }}>
                {children}
            </main>
        </div>
    )
}
