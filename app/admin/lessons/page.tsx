'use client'

import { useState, useEffect } from 'react'
import { createAdminClient } from '@/utils/supabase/admin-client'
import type { Lesson, Course } from '@/types/supabase'
import { Plus, Pencil, Trash2, X, Check, Video, FileText } from 'lucide-react'

export default function AdminLessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCourseId, setSelectedCourseId] = useState<number | 'all'>('all')
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
        const [lessonsResult, coursesResult] = await Promise.all([
            supabase.from('lessons').select('*').order('lesson_order', { ascending: true }),
            supabase.from('courses').select('*').order('title', { ascending: true }),
        ])

        setLessons(lessonsResult.data || [])
        setCourses(coursesResult.data || [])
        setLoading(false)
    }

    const filteredLessons = selectedCourseId === 'all'
        ? lessons
        : lessons.filter(l => l.course_id === selectedCourseId)

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
            setFormData({
                course_id: courses[0]?.id || 0,
                title: '',
                drive_file_id: '',
                type: 'video',
                lesson_order: lessons.length + 1,
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
        if (!confirm(`Bạn có chắc muốn xóa bài học "${lesson.title}"?`)) {
            return
        }

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
        return courses.find(c => c.id === courseId)?.title || 'Không xác định'
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
                    <h1 className="text-3xl font-bold text-zinc-900">Quản lý bài học</h1>
                    <p className="text-zinc-600 mt-1">Thêm, sửa, xóa các bài học trong khóa học</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                    disabled={courses.length === 0}
                >
                    <Plus className="w-5 h-5" />
                    Thêm bài học
                </button>
            </div>

            {/* Filter by Course */}
            <div className="mb-6">
                <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">Tất cả khóa học</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                </select>
            </div>

            {/* Lessons Table */}
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">STT</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Tiêu đề</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Khóa học</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Loại</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Miễn phí</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-zinc-600">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {filteredLessons.map((lesson) => (
                            <tr key={lesson.id} className="hover:bg-zinc-50">
                                <td className="px-6 py-4 text-zinc-600">{lesson.lesson_order}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-zinc-900">{lesson.title}</div>
                                    <div className="text-sm text-zinc-500">{lesson.drive_file_id}</div>
                                </td>
                                <td className="px-6 py-4 text-zinc-600">
                                    {getCourseTitle(lesson.course_id)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${lesson.type === 'video'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {lesson.type === 'video' ? (
                                            <><Video className="w-3 h-3" /> Video</>
                                        ) : (
                                            <><FileText className="w-3 h-3" /> PDF</>
                                        )}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {lesson.is_free ? (
                                        <span className="text-emerald-600 font-medium">Có</span>
                                    ) : (
                                        <span className="text-zinc-400">Không</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openModal(lesson)}
                                            className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(lesson)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredLessons.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                    {courses.length === 0
                                        ? 'Vui lòng tạo khóa học trước khi thêm bài học.'
                                        : 'Chưa có bài học nào. Nhấn "Thêm bài học" để bắt đầu.'}
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
                                {editingLesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
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
                                    Khóa học *
                                </label>
                                <select
                                    value={formData.course_id}
                                    onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Tiêu đề bài học *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Google Drive File ID *
                                </label>
                                <input
                                    type="text"
                                    value={formData.drive_file_id}
                                    onChange={(e) => setFormData({ ...formData, drive_file_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    placeholder="vd: 1abc123..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Loại nội dung
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'video' | 'pdf' })}
                                        className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="video">Video</option>
                                        <option value="pdf">PDF</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Thứ tự
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.lesson_order}
                                        onChange={(e) => setFormData({ ...formData, lesson_order: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
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
                                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="is_free" className="text-sm font-medium text-zinc-700">
                                    Bài học miễn phí (có thể xem không cần mua khóa học)
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
                                    {editingLesson ? 'Cập nhật' : 'Tạo bài học'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
