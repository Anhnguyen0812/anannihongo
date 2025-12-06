import { createClient } from '@/utils/supabase/server'
import { Users, Shield, UserCheck, UserX } from 'lucide-react'
import UserManagementClient from './UserManagementClient'

export default async function AdminUsersPage() {
    const supabase = await createClient()

    // Fetch all users with their profiles
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
    }

    const allUsers = users || []
    const adminCount = allUsers.filter(u => (u as any).role === 'admin').length
    const userCount = allUsers.filter(u => (u as any).role === 'user').length

    const stats = [
        {
            label: 'Tổng người dùng',
            value: allUsers.length,
            icon: Users,
            color: 'bg-indigo-100 text-indigo-600',
        },
        {
            label: 'Quản trị viên',
            value: adminCount,
            icon: Shield,
            color: 'bg-rose-100 text-rose-600',
        },
        {
            label: 'Người dùng thường',
            value: userCount,
            icon: UserCheck,
            color: 'bg-emerald-100 text-emerald-600',
        },
        {
            label: 'Chưa xác định',
            value: allUsers.length - adminCount - userCount,
            icon: UserX,
            color: 'bg-zinc-100 text-zinc-600',
        },
    ]

    return (
        <div>
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-xl font-bold text-zinc-900">Quản lý người dùng</h1>
                <p className="text-sm text-zinc-600">Xem và quản lý tài khoản người dùng trong hệ thống</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-xl p-3 border border-zinc-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-zinc-500">{stat.label}</p>
                                <p className="text-xl font-bold text-zinc-900 mt-0.5">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* User Management Table - Client Component */}
            <UserManagementClient initialUsers={allUsers} />
        </div>
    )
}
