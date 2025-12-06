'use client'

import { useState, useEffect } from 'react'
import { createAdminClient } from '@/utils/supabase/admin-client'
import type { Lesson, Course } from '@/types/supabase'
import { Plus, Pencil, Trash2, X, Check, Video, FileText, Search } from 'lucide-react'

export default function AdminLessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCourseId, setSelectedCourseId] = useState<number | 'all'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
    const [formData, setFormData] = useState({
        course_id: 0,
        title: '',
        drive_file_id: '',
        type: 'video' as 'video' | 'pdf',
        lesson_order: 1,
        is_free: false,
    })
    const [saving, setSaving] = useState(false)

    const supabase = createAdminClient()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const [lessonsResult, coursesResult] = await Promise.all([
            supabase.from('lessons').select('*').order('lesson_order', { ascending: true }),
            supabase.from('courses').select('*').order('title', { ascending: true }),
        ])

        setLessons(lessonsResult.data || [])
        setCourses(coursesResult.data || [])
        setLoading(false)
    }

    const filteredLessons = lessons.filter(lesson => {
        const matchesCourse = selectedCourseId === 'all' || lesson.course_id === selectedCourseId
        const matchesSearch = !searchTerm ||
            lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lesson.drive_file_id.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCourse && matchesSearch
    })

    function openModal(lesson?: Lesson) {
        if (lesson) {
            setEditingLesson(lesson)
            setFormData({
                course_id: lesson.course_id,
                title: lesson.title,
                drive_file_id: lesson.drive_file_id,
                type: lesson.type,
                lesson_order: lesson.lesson_order,
                is_free: lesson.is_free,
            })
        } else {
            setEditingLesson(null)
            const defaultCourseId = selectedCourseId === 'all' ? (courses[0]?.id || 0) : selectedCourseId
            const maxOrder = lessons.filter(l => l.course_id === defaultCourseId).length
            setFormData({
                course_id: defaultCourseId,
                title: '',
                drive_file_id: '',
                type: 'video',
                lesson_order: maxOrder + 1,
                is_free: false,
            })
        }
        setIsModalOpen(true)
    }

    function closeModal() {
        setIsModalOpen(false)
        setEditingLesson(null)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        try {
            if (editingLesson) {
                const { error } = await supabase
                    .from('lessons')
                    .update(formData)
                    .eq('id', editingLesson.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('lessons')
                    .insert(formData)

                if (error) throw error
            }

            fetchData()
            closeModal()
        } catch (error) {
            console.error('Error saving lesson:', error)
            alert('Có lỗi xảy ra khi lưu bài học')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(lesson: Lesson) {
        if (!confirm(`Xóa bài học "${lesson.title}"?`)) return

        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lesson.id)

        if (error) {
            console.error('Error deleting lesson:', error)
            alert('Có lỗi xảy ra khi xóa bài học')
        } else {
            fetchData()
        }
    }

    const getCourseTitle = (courseId: number) => {
        return courses.find(c => c.id === courseId)?.title || '-'
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
                    <h1 className="text-xl font-bold text-zinc-900">Quản lý bài học</h1>
                    <p className="text-sm text-zinc-600">Tổng: {lessons.length} bài học</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    disabled={courses.length === 0}
                >
                    <Plus className="w-4 h-4" />
                    Thêm
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm bài học..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">Tất cả khóa học</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                </select>
            </div>

            {/* Lessons Table */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="text-left px-3 py-2 font-medium text-zinc-600 w-12">#</th>
                            <th className="text-left px-3 py-2 font-medium text-zinc-600">Tiêu đề</th>
                            <th className="text-left px-3 py-2 font-medium text-zinc-600">Khóa học</th>
                            <th className="text-left px-3 py-2 font-medium text-zinc-600 w-16">Loại</th>
                            <th className="text-center px-3 py-2 font-medium text-zinc-600 w-16">Free</th>
                            <th className="text-right px-3 py-2 font-medium text-zinc-600 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {filteredLessons.map((lesson) => (
                            <tr key={lesson.id} className="hover:bg-zinc-50">
                                <td className="px-3 py-2 text-zinc-500">{lesson.lesson_order}</td>
                                <td className="px-3 py-2">
                                    <div className="font-medium text-zinc-900 truncate max-w-[250px]">{lesson.title}</div>
                                    <div className="text-xs text-zinc-400 truncate max-w-[250px]">{lesson.drive_file_id}</div>
                                </td>
                                <td className="px-3 py-2">
                                    <span className="text-zinc-600 truncate block max-w-[120px]">
                                        {getCourseTitle(lesson.course_id)}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${lesson.type === 'video'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {lesson.type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                        {lesson.type === 'video' ? 'Video' : 'PDF'}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                    {lesson.is_free ? (
                                        <span className="text-emerald-600">✓</span>
                                    ) : (
                                        <span className="text-zinc-300">-</span>
                                    )}
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => openModal(lesson)}
                                            className="p-1 text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(lesson)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredLessons.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                                    {courses.length === 0
                                        ? 'Tạo khóa học trước.'
                                        : 'Không có bài học nào.'}
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
                                {editingLesson ? 'Sửa bài học' : 'Thêm bài học'}
                            </h2>
                            <button onClick={closeModal} className="p-1.5 hover:bg-zinc-100 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">Khóa học *</label>
                                <select
                                    value={formData.course_id}
                                    onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value) })}
                                    className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">Tiêu đề *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1">Drive File ID *</label>
                                <input
                                    type="text"
                                    value={formData.drive_file_id}
                                    onChange={(e) => setFormData({ ...formData, drive_file_id: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="1abc123..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Loại</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'video' | 'pdf' })}
                                        className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="video">Video</option>
                                        <option value="pdf">PDF</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Thứ tự</label>
                                    <input
                                        type="number"
                                        value={formData.lesson_order}
                                        onChange={(e) => setFormData({ ...formData, lesson_order: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        min={1}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_free"
                                    checked={formData.is_free}
                                    onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded"
                                />
                                <label htmlFor="is_free" className="text-sm text-zinc-700">
                                    Miễn phí
                                </label>
                            </div>

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
                                    disabled={saving}
                                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                                >
                                    {saving ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {editingLesson ? 'Cập nhật' : 'Tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
