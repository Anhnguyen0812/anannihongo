'use client'

import { useState, useEffect } from 'react'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { Plus, Pencil, Trash2, X, Check, BookOpen } from 'lucide-react'

interface Course {
    id: number
    title: string
    description: string | null
    thumbnail_url: string | null
    created_at: string
}

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
    })
    const [saving, setSaving] = useState(false)

    const supabase = createAdminClient()

    useEffect(() => {
        fetchCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function fetchCourses() {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true })

        if (error) {
            console.error('Error fetching courses:', error)
        }
        
        // Sắp xếp theo thứ tự N5 -> N4 -> N3 -> N2 -> N1
        const sortedData = (data || []).sort((a, b) => {
            const getLevel = (title: string) => {
                const match = title.match(/N(\d)/i)
                if (match) {
                    // N5 = 5, N4 = 4, ... để N5 lên đầu (sắp xếp giảm dần)
                    return parseInt(match[1])
                }
                return 0 // Các khóa học không có N level sẽ ở cuối
            }
            return getLevel(b.title) - getLevel(a.title)
        })
        
        setCourses(sortedData)
        setLoading(false)
    }

    function openModal(course?: Course) {
        if (course) {
            setEditingCourse(course)
            setFormData({
                title: course.title,
                description: course.description || '',
                thumbnail_url: course.thumbnail_url || '',
            })
        } else {
            setEditingCourse(null)
            setFormData({
                title: '',
                description: '',
                thumbnail_url: '',
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
            const dataToSave = {
                title: formData.title,
                description: formData.description || null,
                thumbnail_url: formData.thumbnail_url || null,
            }

            if (editingCourse) {
                const { error } = await supabase
                    .from('courses')
                    .update(dataToSave as never)
                    .eq('id', editingCourse.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('courses')
                    .insert(dataToSave as never)

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
                    <h1 className="text-xl font-bold text-zinc-900">Quản lý khóa học</h1>
                    <p className="text-sm text-zinc-600">Tổng: {courses.length} khóa học</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Thêm khóa học
                </button>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="text-left px-4 py-2.5 font-medium text-zinc-600">ID</th>
                            <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Khóa học</th>
                            <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Mô tả</th>
                            <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Ngày tạo</th>
                            <th className="text-right px-4 py-2.5 font-medium text-zinc-600">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {courses.map((course) => (
                            <tr key={course.id} className="hover:bg-zinc-50">
                                <td className="px-4 py-2.5 text-zinc-500 text-xs font-mono">
                                    {course.id}
                                </td>
                                <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-3">
                                        {course.thumbnail_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                            </div>
                                        )}
                                        <span className="font-medium text-zinc-900">{course.title}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className="text-zinc-600 truncate block max-w-[250px]">
                                        {course.description || '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 text-zinc-500 text-xs">
                                    {new Date(course.created_at).toLocaleDateString('vi-VN', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}
                                </td>
                                <td className="px-4 py-2.5">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => openModal(course)}
                                            className="p-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                                            title="Sửa"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                                    Chưa có khóa học nào. Nhấn &quot;Thêm khóa học&quot; để tạo mới.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                            <h2 className="text-base font-bold text-zinc-900">
                                {editingCourse ? 'Sửa khóa học' : 'Thêm khóa học mới'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Tên khóa học <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="VD: N5 Cơ bản"
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
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    rows={3}
                                    placeholder="Mô tả ngắn về khóa học..."
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
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-xs"
                                    placeholder="https://example.com/image.jpg"
                                />
                                {formData.thumbnail_url && (
                                    <div className="mt-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={formData.thumbnail_url}
                                            alt="Preview"
                                            className="w-20 h-20 rounded-lg object-cover border border-zinc-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !formData.title.trim()}
                                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
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
