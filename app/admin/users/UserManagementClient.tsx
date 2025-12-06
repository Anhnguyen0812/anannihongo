'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User, Shield, Search, MoreVertical, Eye, Trash2, RefreshCw, Edit, Save, X } from 'lucide-react'
import { updateUserRole, deleteUser, updateUserProfile } from './actions'

interface UserProfile {
    id: string
    email: string | null
    full_name: string | null
    avatar_url: string | null
    role: string
    updated_at: string
}

interface UserManagementClientProps {
    initialUsers: UserProfile[]
}

interface EditFormData {
    full_name: string
    email: string
    avatar_url: string
    role: string
}

interface MenuPosition {
    top: number
    left: number
}

export default function UserManagementClient({ initialUsers }: UserManagementClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
    const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 0, left: 0 })
    const [editForm, setEditForm] = useState<EditFormData>({
        full_name: '',
        email: '',
        avatar_url: '',
        role: 'user'
    })

    const filteredUsers = initialUsers.filter(user => {
        const matchesSearch = !searchTerm ||
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Quản trị viên'
            case 'user': return 'Người dùng'
            default: return role || 'Chưa xác định'
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-rose-100 text-rose-700'
            case 'user': return 'bg-emerald-100 text-emerald-700'
            default: return 'bg-zinc-100 text-zinc-600'
        }
    }

    const handleRoleChange = async (userId: string, newRole: string, userName: string) => {
        if (!confirm(`Đổi quyền của "${userName}" thành ${getRoleLabel(newRole)}?`)) {
            return
        }

        startTransition(async () => {
            const result = await updateUserRole(userId, newRole)
            if (result.error) {
                alert('Có lỗi xảy ra: ' + result.error)
            } else {
                router.refresh()
            }
        })
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) return

        startTransition(async () => {
            const result = await deleteUser(selectedUser.id)
            if (result.error) {
                alert('Có lỗi xảy ra: ' + result.error)
            } else {
                setShowDeleteModal(false)
                setSelectedUser(null)
                router.refresh()
            }
        })
    }

    const openActionMenu = (userId: string, event: React.MouseEvent<HTMLButtonElement>) => {
        if (actionMenuOpen === userId) {
            setActionMenuOpen(null)
            return
        }
        
        const button = event.currentTarget
        const rect = button.getBoundingClientRect()
        
        // Tính toán vị trí menu
        const menuWidth = 160
        const menuHeight = 150
        
        let left = rect.left - menuWidth + rect.width
        let top = rect.bottom + 4
        
        // Đảm bảo menu không bị tràn ra ngoài viewport
        if (left < 10) left = 10
        if (left + menuWidth > window.innerWidth - 10) {
            left = window.innerWidth - menuWidth - 10
        }
        if (top + menuHeight > window.innerHeight - 10) {
            top = rect.top - menuHeight - 4
        }
        
        setMenuPosition({ top, left })
        setActionMenuOpen(userId)
    }

    const openDetailModal = (user: UserProfile) => {
        setSelectedUser(user)
        setShowDetailModal(true)
        setActionMenuOpen(null)
    }

    const openEditModal = (user: UserProfile) => {
        setSelectedUser(user)
        setEditForm({
            full_name: user.full_name || '',
            email: user.email || '',
            avatar_url: user.avatar_url || '',
            role: user.role || 'user'
        })
        setShowEditModal(true)
        setActionMenuOpen(null)
    }

    const handleUpdateProfile = async () => {
        if (!selectedUser) return

        const dataToUpdate = {
            full_name: editForm.full_name.trim() || null,
            email: editForm.email.trim() || null,
            avatar_url: editForm.avatar_url.trim() || null,
            role: editForm.role
        }
        
        console.log('Sending update data:', dataToUpdate)

        startTransition(async () => {
            const result = await updateUserProfile(selectedUser.id, dataToUpdate as any)
            console.log('Update result:', result)
            if (result.error) {
                alert('Có lỗi xảy ra: ' + result.error)
            } else {
                setShowEditModal(false)
                setSelectedUser(null)
                router.refresh()
            }
        })
    }

    const openDeleteModal = (user: UserProfile) => {
        setSelectedUser(user)
        setShowDeleteModal(true)
        setActionMenuOpen(null)
    }

    return (
        <>
            {/* Filters */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên hoặc email..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                    className="px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                    <option value="all">Tất cả quyền</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="user">Người dùng</option>
                </select>
                <button
                    onClick={() => {
                        startTransition(() => {
                            router.refresh()
                        })
                    }}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Người dùng</th>
                            <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Email</th>
                            <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Quyền</th>
                            <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Cập nhật lần cuối</th>
                            <th className="text-center px-4 py-2.5 font-medium text-zinc-600">Đổi quyền</th>
                            <th className="text-center px-4 py-2.5 font-medium text-zinc-600 w-16">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                                <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {user.avatar_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.full_name || ''}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-4 h-4 text-indigo-600" />
                                            )}
                                        </div>
                                        <span className="font-medium text-zinc-900 truncate max-w-[150px]">
                                            {user.full_name || 'Chưa đặt tên'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className="text-zinc-600 truncate block max-w-[200px]">
                                        {user.email || 'Không có email'}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                        <Shield className="w-3 h-3" />
                                        {getRoleLabel(user.role)}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className="text-zinc-500 text-xs">
                                        {user.updated_at ? new Date(user.updated_at).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'N/A'}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <div className="flex justify-center">
                                        <select
                                            value={user.role || 'user'}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value, user.full_name || user.email || 'User')}
                                            disabled={isPending}
                                            className="px-2 py-1 text-xs border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white disabled:opacity-50"
                                        >
                                            <option value="admin">Quản trị viên</option>
                                            <option value="user">Người dùng</option>
                                        </select>
                                    </div>
                                </td>
                                <td className="px-4 py-2.5">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openActionMenu(user.id, e)
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4 text-zinc-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                                    {searchTerm || roleFilter !== 'all' 
                                        ? 'Không tìm thấy người dùng phù hợp với bộ lọc.' 
                                        : 'Chưa có người dùng nào trong hệ thống.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination info */}
            <div className="mt-3 text-xs text-zinc-500">
                Hiển thị {filteredUsers.length} / {initialUsers.length} người dùng
            </div>

            {/* Action Menu Dropdown - Positioned near button */}
            {actionMenuOpen && (
                <>
                    {/* Backdrop - transparent, just for catching clicks */}
                    <div 
                        className="fixed inset-0"
                        style={{ zIndex: 9998 }}
                        onClick={() => setActionMenuOpen(null)}
                    />
                    {/* Menu - positioned near the button */}
                    <div 
                        className="fixed bg-white border border-zinc-200 rounded-lg shadow-lg py-1 min-w-[160px]"
                        style={{ 
                            zIndex: 9999,
                            top: menuPosition.top,
                            left: menuPosition.left,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                const user = initialUsers.find(u => u.id === actionMenuOpen)
                                if (user) openDetailModal(user)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                        >
                            <Eye className="w-4 h-4" />
                            <span>Xem chi tiết</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const user = initialUsers.find(u => u.id === actionMenuOpen)
                                if (user) openEditModal(user)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Chỉnh sửa</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const user = initialUsers.find(u => u.id === actionMenuOpen)
                                if (user) openDeleteModal(user)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Xóa tài khoản</span>
                        </button>
                    </div>
                </>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">Chi tiết người dùng</h3>
                        
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {selectedUser.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={selectedUser.avatar_url}
                                        alt={selectedUser.full_name || ''}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-indigo-600" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-zinc-900">{selectedUser.full_name || 'Chưa đặt tên'}</h4>
                                <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-zinc-100">
                                <span className="text-zinc-500">ID</span>
                                <span className="text-zinc-900 font-mono text-xs">{selectedUser.id.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-100">
                                <span className="text-zinc-500">Quyền</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                                    <Shield className="w-3 h-3" />
                                    {getRoleLabel(selectedUser.role)}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-100">
                                <span className="text-zinc-500">Cập nhật lần cuối</span>
                                <span className="text-zinc-900">
                                    {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleString('vi-VN') : 'N/A'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="w-full mt-6 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors font-medium"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">Xác nhận xóa tài khoản</h3>
                        <p className="text-sm text-zinc-600 mb-4">
                            Bạn có chắc chắn muốn xóa tài khoản của <strong>{selectedUser.full_name || selectedUser.email}</strong>? 
                            Hành động này không thể hoàn tác.
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isPending}
                                className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={isPending}
                                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Đang xóa...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Xóa tài khoản
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-zinc-900">Chỉnh sửa thông tin</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        {/* Avatar Preview */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-zinc-200">
                                {editForm.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={editForm.avatar_url}
                                        alt="Avatar preview"
                                        className="w-16 h-16 rounded-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none'
                                        }}
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-indigo-600" />
                                )}
                            </div>
                            <div className="text-sm text-zinc-500">
                                <p className="font-medium text-zinc-900">{selectedUser.full_name || 'Chưa đặt tên'}</p>
                                <p className="text-xs font-mono">{selectedUser.id.slice(0, 8)}...</p>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    placeholder="Nhập họ và tên..."
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    placeholder="Nhập email..."
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Link ảnh Avatar
                                </label>
                                <input
                                    type="url"
                                    value={editForm.avatar_url}
                                    onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-xs"
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    Nhập URL hình ảnh (jpg, png, webp...)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Quyền
                                </label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                >
                                    <option value="admin">Quản trị viên</option>
                                    <option value="user">Người dùng</option>
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                disabled={isPending}
                                className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateProfile}
                                disabled={isPending}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
