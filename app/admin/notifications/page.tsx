'use client'

import { useState, useEffect } from 'react'
import { createAdminClient } from '@/utils/supabase/admin-client'
import type { Notification, Profile } from '@/types/supabase'
import { Plus, Trash2, X, Check, Send, Bell, Users, Globe } from 'lucide-react'

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
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Create notification
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

            // Send to users based on target type
            if (formData.target_type === 'all') {
                // Send to all users
                const { error } = await supabase.rpc('send_notification_to_all', {
                    notification_id_param: notification.id
                })
                if (error) {
                    // Fallback: insert manually for all users
                    const userIds = users.map(u => u.id)
                    await supabase.from('user_notifications').insert(
                        userIds.map(userId => ({
                            user_id: userId,
                            notification_id: notification.id,
                        }))
                    )
                }
            } else if (formData.selected_users.length > 0) {
                // Send to selected users
                const { error } = await supabase.rpc('send_notification_to_users', {
                    notification_id_param: notification.id,
                    user_ids: formData.selected_users
                })
                if (error) {
                    // Fallback: insert manually
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
        if (!confirm(`Bạn có chắc muốn xóa thông báo "${notification.title}"?`)) {
            return
        }

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
            case 'general': return 'Thông báo chung'
            case 'course': return 'Khóa học'
            case 'announcement': return 'Tin quan trọng'
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Quản lý thông báo</h1>
                    <p className="text-zinc-600 mt-1">Gửi thông báo đến người dùng</p>
                </div>
                <button
                    onClick={openModal}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Tạo thông báo
                </button>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="divide-y divide-zinc-100">
                    {notifications.map((notification) => (
                        <div key={notification.id} className="p-6 hover:bg-zinc-50">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Bell className="w-5 h-5 text-zinc-400" />
                                        <h3 className="font-semibold text-zinc-900">{notification.title}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                                            {getTypeLabel(notification.type)}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${notification.target_type === 'all'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {notification.target_type === 'all' ? (
                                                <><Globe className="w-3 h-3" /> Tất cả</>
                                            ) : (
                                                <><Users className="w-3 h-3" /> Chọn lọc</>
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-zinc-600 ml-8">{notification.content}</p>
                                    <p className="text-sm text-zinc-400 mt-2 ml-8">
                                        {new Date(notification.created_at).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(notification)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Xóa"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && (
                        <div className="p-12 text-center text-zinc-500">
                            Chưa có thông báo nào. Nhấn &quot;Tạo thông báo&quot; để bắt đầu.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
                            <h2 className="text-xl font-bold text-zinc-900">Tạo thông báo mới</h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Tiêu đề *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Nhập tiêu đề thông báo"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Nội dung *
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    rows={4}
                                    placeholder="Nhập nội dung thông báo"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Loại thông báo
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                                        className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="general">Thông báo chung</option>
                                        <option value="course">Khóa học</option>
                                        <option value="announcement">Tin quan trọng</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Gửi đến
                                    </label>
                                    <select
                                        value={formData.target_type}
                                        onChange={(e) => setFormData({ ...formData, target_type: e.target.value as typeof formData.target_type })}
                                        className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="all">Tất cả người dùng</option>
                                        <option value="selected">Chọn người dùng</option>
                                    </select>
                                </div>
                            </div>

                            {/* User Selection */}
                            {formData.target_type === 'selected' && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        Chọn người dùng ({formData.selected_users.length} đã chọn)
                                    </label>
                                    <div className="max-h-48 overflow-y-auto border border-zinc-200 rounded-xl p-2 space-y-1">
                                        {users.filter(u => u.role !== 'admin').map((user) => (
                                            <label
                                                key={user.id}
                                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${formData.selected_users.includes(user.id)
                                                    ? 'bg-indigo-50'
                                                    : 'hover:bg-zinc-50'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selected_users.includes(user.id)}
                                                    onChange={() => toggleUserSelection(user.id)}
                                                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                                                />
                                                <div>
                                                    <div className="font-medium text-zinc-900">
                                                        {user.full_name || 'Chưa đặt tên'}
                                                    </div>
                                                    <div className="text-sm text-zinc-500">{user.email}</div>
                                                </div>
                                            </label>
                                        ))}
                                        {users.filter(u => u.role !== 'admin').length === 0 && (
                                            <p className="text-center text-zinc-500 py-4">
                                                Không có người dùng nào
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || (formData.target_type === 'selected' && formData.selected_users.length === 0)}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Gửi thông báo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
