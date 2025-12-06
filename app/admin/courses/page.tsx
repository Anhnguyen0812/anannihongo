'use client'

import { useState, useEffect } from 'react'
import { createAdminClient } from '@/utils/supabase/admin-client'
import type { Course } from '@/types/supabase'
import { Plus, Pencil, Trash2, X, Check, Eye, EyeOff } from 'lucide-react'

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
        slug: '',
        price: 0,
        is_published: false,
    })
    const [saving, setSaving] = useState(false)

    const supabase = createAdminClient()

    useEffect(() => {
        fetchCourses()
    }, [])

    async function fetchCourses() {
        const { data } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false })

        setCourses(data || [])
        setLoading(false)
    }

    function openModal(course?: Course) {
        if (course) {
            setEditingCourse(course)
            setFormData({
                title: course.title,
                description: course.description || '',
                thumbnail_url: course.thumbnail_url || '',
                slug: course.slug || '',
                price: course.price,
                is_published: course.is_published,
            })
        } else {
            setEditingCourse(null)
            setFormData({
                title: '',
                description: '',
                thumbnail_url: '',
                slug: '',
                price: 0,
                is_published: false,
            })
        }
        setIsModalOpen(true)
    }

    function closeModal() {
        setIsModalOpen(false)
        setEditingCourse(null)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        try {
            if (editingCourse) {
                // Update existing course
                const { error } = await supabase
                    .from('courses')
                    .update(formData as any)
                    .eq('id', editingCourse.id)

                if (error) throw error
            } else {
                // Create new course
                const { error } = await supabase
                    .from('courses')
                    .insert(formData as any)

                if (error) throw error
            }

            fetchCourses()
            closeModal()
        } catch (error) {
            console.error('Error saving course:', error)
            alert('Có lỗi xảy ra khi lưu khóa học')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(course: Course) {
        if (!confirm(`Bạn có chắc muốn xóa khóa học "${course.title}"?`)) {
            return
        }

        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', course.id)

        if (error) {
            console.error('Error deleting course:', error)
            alert('Có lỗi xảy ra khi xóa khóa học')
        } else {
            fetchCourses()
        }
    }

    async function togglePublished(course: Course) {
        const { error } = await supabase
            .from('courses')
            .update({ is_published: !course.is_published } as any)
            .eq('id', course.id)

        if (!error) {
            fetchCourses()
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
                    <h1 className="text-3xl font-bold text-zinc-900">Quản lý khóa học</h1>
                    <p className="text-zinc-600 mt-1">Thêm, sửa, xóa các khóa học</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Thêm khóa học
                </button>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Tiêu đề</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Slug</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Giá</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Trạng thái</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-zinc-600">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {courses.map((course) => (
                            <tr key={course.id} className="hover:bg-zinc-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-zinc-900">{course.title}</div>
                                    <div className="text-sm text-zinc-500 truncate max-w-xs">
                                        {course.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-600">{course.slug || '-'}</td>
                                <td className="px-6 py-4 text-zinc-600">
                                    {course.price === 0 ? (
                                        <span className="text-emerald-600 font-medium">Miễn phí</span>
                                    ) : (
                                        `${course.price.toLocaleString()}đ`
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => togglePublished(course)}
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${course.is_published
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-zinc-100 text-zinc-600'
                                            }`}
                                    >
                                        {course.is_published ? (
                                            <>
                                                <Eye className="w-4 h-4" />
                                                Đã xuất bản
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="w-4 h-4" />
                                                Bản nháp
                                            </>
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openModal(course)}
                                            className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {courses.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                    Chưa có khóa học nào. Nhấn &quot;Thêm khóa học&quot; để bắt đầu.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
                            <h2 className="text-xl font-bold text-zinc-900">
                                {editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
                            </h2>
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
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Slug (URL)
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="vd: n5-beginner"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    URL Thumbnail
                                </label>
                                <input
                                    type="url"
                                    value={formData.thumbnail_url}
                                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Giá (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    min={0}
                                />
                                <p className="text-sm text-zinc-500 mt-1">Để 0 nếu miễn phí</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_published"
                                    checked={formData.is_published}
                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="is_published" className="text-sm font-medium text-zinc-700">
                                    Xuất bản ngay
                                </label>
                            </div>

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
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {editingCourse ? 'Cập nhật' : 'Tạo khóa học'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
