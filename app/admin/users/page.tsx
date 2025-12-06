'use client'

import { useState, useEffect } from 'react'
import { createAdminClient } from '@/utils/supabase/admin-client'
import type { Profile } from '@/types/supabase'
import { User, Mail, Shield, Clock } from 'lucide-react'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createAdminClient()

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        setUsers(data || [])
        setLoading(false)
    }

    async function toggleRole(user: Profile) {
        const newRole = user.role === 'admin' ? 'student' : 'admin'

        if (!confirm(`Bạn có chắc muốn đổi quyền của "${user.full_name || user.email}" thành ${newRole}?`)) {
            return
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', user.id)

        if (error) {
            console.error('Error updating role:', error)
            alert('Có lỗi xảy ra khi cập nhật quyền')
        } else {
            fetchUsers()
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900">Quản lý người dùng</h1>
                <p className="text-zinc-600 mt-1">Xem danh sách và quản lý quyền người dùng</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-zinc-200">
                    <p className="text-sm text-zinc-500">Tổng người dùng</p>
                    <p className="text-2xl font-bold text-zinc-900">{users.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-zinc-200">
                    <p className="text-sm text-zinc-500">Quản trị viên</p>
                    <p className="text-2xl font-bold text-indigo-600">
                        {users.filter(u => u.role === 'admin').length}
                    </p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Người dùng</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Email</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Quyền</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Ngày tham gia</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-zinc-600">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-zinc-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.full_name || ''}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5 text-indigo-600" />
                                            )}
                                        </div>
                                        <span className="font-medium text-zinc-900">
                                            {user.full_name || 'Chưa đặt tên'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-zinc-600">
                                        <Mail className="w-4 h-4 text-zinc-400" />
                                        {user.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${user.role === 'admin'
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'bg-zinc-100 text-zinc-600'
                                        }`}>
                                        <Shield className="w-3 h-3" />
                                        {user.role === 'admin' ? 'Admin' : 'Student'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-zinc-600">
                                        <Clock className="w-4 h-4 text-zinc-400" />
                                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => toggleRole(user)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${user.role === 'admin'
                                                ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                                }`}
                                        >
                                            {user.role === 'admin' ? 'Hủy Admin' : 'Cấp Admin'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                    Chưa có người dùng nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
