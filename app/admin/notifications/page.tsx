'use client'

import { useState, useEffect } from 'react'
import { createAdminClient } from '@/utils/supabase/admin-client'
import type { Notification, Profile } from '@/types/supabase'
import { Plus, Trash2, X, Send, Bell, Users, Globe, Search } from 'lucide-react'

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'general' as 'general' | 'course' | 'announcement',
        target_type: 'all' as 'all' | 'selected',
        selected_users: [] as string[],
    })
    const [saving, setSaving] = useState(false)
    const [userSearch, setUserSearch] = useState('')

    const supabase = createAdminClient()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const [notificationsResult, usersResult] = await Promise.all([
            supabase.from('notifications').select('*').order('created_at', { ascending: false }),
            supabase.from('profiles').select('*').order('full_name', { ascending: true }),
        ])

        setNotifications(notificationsResult.data || [])
        setUsers(usersResult.data || [])
        setLoading(false)
    }

    function openModal() {
        setFormData({
            title: '',
            content: '',
            type: 'general',
            target_type: 'all',
            selected_users: [],
        })
        setUserSearch('')
        setIsModalOpen(true)
    }

    function closeModal() {
        setIsModalOpen(false)
    }

    function toggleUserSelection(userId: string) {
        setFormData(prev => ({
            ...prev,
            selected_users: prev.selected_users.includes(userId)
                ? prev.selected_users.filter(id => id !== userId)
                : [...prev.selected_users, userId]
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: notification, error: insertError } = await supabase
                .from('notifications')
                .insert({
                    title: formData.title,
                    content: formData.content,
                    type: formData.type,
                    target_type: formData.target_type,
                    created_by: user.id,
                })
                .select()
                .single()

            if (insertError) throw insertError

            if (formData.target_type === 'all') {
                const { error } = await supabase.rpc('send_notification_to_all', {
                    notification_id_param: notification.id
                })
                if (error) {
                    const userIds = users.map(u => u.id)
                    await supabase.from('user_notifications').insert(
                        userIds.map(userId => ({
                            user_id: userId,
                            notification_id: notification.id,
                        }))
                    )
                }
            } else if (formData.selected_users.length > 0) {
                const { error } = await supabase.rpc('send_notification_to_users', {
                    notification_id_param: notification.id,
                    user_ids: formData.selected_users
                })
                if (error) {
                    await supabase.from('user_notifications').insert(
                        formData.selected_users.map(userId => ({
                            user_id: userId,
                            notification_id: notification.id,
                        }))
                    )
                }
            }

            fetchData()
            closeModal()
        } catch (error) {
            console.error('Error sending notification:', error)
            alert('Có lỗi xảy ra khi gửi thông báo')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(notification: Notification) {
        if (!confirm(`Xóa thông báo "${notification.title}"?`)) return

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notification.id)

        if (error) {
            console.error('Error deleting notification:', error)
            alert('Có lỗi xảy ra khi xóa thông báo')
        } else {
            fetchData()
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'general': return 'Chung'
            case 'course': return 'Khóa học'
            case 'announcement': return 'Quan trọng'
            default: return type
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'general': return 'bg-blue-100 text-blue-700'
            case 'course': return 'bg-purple-100 text-purple-700'
            case 'announcement': return 'bg-rose-100 text-rose-700'
            default: return 'bg-zinc-100 text-zinc-700'
        }
    }

    const filteredUsersForSelection = users.filter(u =>
        u.role !== 'admin' &&
        (!userSearch ||
            u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(userSearch.toLowerCase())
        )
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-zinc-900">Quản lý thông báo</h1>
                    <p className="text-sm text-zinc-600">Tổng: {notifications.length} thông báo</p>
                </div>
                <button
                    onClick={openModal}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Tạo
                </button>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="divide-y divide-zinc-100">
                    {notifications.map((notification) => (
                        <div key={notification.id} className="p-3 hover:bg-zinc-50 flex items-start gap-3">
                            <Bell className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-medium text-sm text-zinc-900">{notification.title}</h3>
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getTypeColor(notification.type)}`}>
                                        {getTypeLabel(notification.type)}
                                    </span>
                                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${notification.target_type === 'all'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {notification.target_type === 'all' ? <Globe className="w-2.5 h-2.5" /> : <Users className="w-2.5 h-2.5" />}
                                        {notification.target_type === 'all' ? 'Tất cả' : 'Chọn lọc'}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-600 mt-0.5 line-clamp-1">{notification.content}</p>
                                <p className="text-xs text-zinc-400 mt-1">
                                    {new Date(notification.created_at).toLocaleString('vi-VN')}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(notification)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {notifications.length === 0 && (
                        <div className="p-8 text-center text-zinc-500 text-sm">
                            Chưa có thông báo nào.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                            <h2 className="text-base font-bold text-zinc-900">Tạo thông báo</h2>
                            <button onClick={closeModal} className="p-1.5 hover:bg-zinc-100 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">Tiêu đề *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Tiêu đề thông báo"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">Nội dung *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    rows={2}
                                    placeholder="Nội dung thông báo"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Loại</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                                        className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="general">Chung</option>
                                        <option value="course">Khóa học</option>
                                        <option value="announcement">Quan trọng</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Gửi đến</label>
                                    <select
                                        value={formData.target_type}
                                        onChange={(e) => setFormData({ ...formData, target_type: e.target.value as typeof formData.target_type })}
                                        className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="selected">Chọn người dùng</option>
                                    </select>
                                </div>
                            </div>

                            {formData.target_type === 'selected' && (
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                                        Chọn người dùng ({formData.selected_users.length})
                                    </label>
                                    <div className="relative mb-2">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            placeholder="Tìm người dùng..."
                                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="max-h-32 overflow-y-auto border border-zinc-200 rounded-lg">
                                        {filteredUsersForSelection.map((user) => (
                                            <label
                                                key={user.id}
                                                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer text-sm ${formData.selected_users.includes(user.id) ? 'bg-indigo-50' : 'hover:bg-zinc-50'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selected_users.includes(user.id)}
                                                    onChange={() => toggleUserSelection(user.id)}
                                                    className="w-3.5 h-3.5 text-indigo-600 border-zinc-300 rounded"
                                                />
                                                <span className="truncate">{user.full_name || user.email}</span>
                                            </label>
                                        ))}
                                        {filteredUsersForSelection.length === 0 && (
                                            <p className="text-center text-zinc-500 py-3 text-xs">Không tìm thấy</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || (formData.target_type === 'selected' && formData.selected_users.length === 0)}
                                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                                >
                                    {saving ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Gửi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
