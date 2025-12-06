"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, ChevronLeft, FileText, Video, Menu, X, CheckCircle2, ChevronDown, Folder, Home, BookOpen, GraduationCap, User } from 'lucide-react'
import { completeLesson, uncompleteLesson } from '@/app/learn/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lesson, Course, OrganizedLessons, FolderNode } from '@/types'
import Chatbot from '@/components/Chatbot'

interface LessonPlayerProps {
    currentLesson: Lesson
    allLessons: Lesson[]
    organizedLessons: OrganizedLessons
    course: Course
    user: any
}

// Recursive Folder Component
const FolderItem = ({
    name,
    content,
    courseId,
    currentLessonId,
    level = 0
}: {
    name: string
    content: FolderNode
    courseId: string
    currentLessonId: number
    level?: number
}) => {
    // Check if current lesson is inside this folder or its subfolders
    const containsCurrentLesson = (folderContent: FolderNode): boolean => {
        if (folderContent._lessons?.some((l) => l.id === currentLessonId)) {
            return true
        }
        if (folderContent._children) {
            return Object.values(folderContent._children).some((child) => containsCurrentLesson(child))
        }
        return false
    }

    const isCurrentPath = containsCurrentLesson(content)
    const [isOpen, setIsOpen] = useState(isCurrentPath)

    // Update isOpen when currentLessonId changes (for navigation)
    useEffect(() => {
        if (isCurrentPath) {
            setIsOpen(true)
        }
    }, [currentLessonId, isCurrentPath])

    const hasChildren = content._children && Object.keys(content._children).length > 0
    const hasLessons = content._lessons && content._lessons.length > 0

    return (
        <div className="select-none">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full flex items-center gap-2 p-2 hover:bg-primary/5 rounded-lg transition-colors
          ${level === 0 ? 'font-bold text-foreground' : 'text-sm font-medium text-muted-foreground'}
        `}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`}
                />
                {level > 0 && <Folder className={`h-4 w-4 ${isCurrentPath ? 'text-primary' : 'text-primary/50'}`} />}
                <span className={`truncate ${isCurrentPath && level > 0 ? 'text-primary font-semibold' : ''}`}>{name}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {/* Render Sub-folders (Sorted Alphabetically) */}
                        {hasChildren && Object.entries(content._children)
                            .sort(([a], [b]) => a.localeCompare(b, 'vi', { numeric: true }))
                            .map(([childName, childContent]) => (
                                <FolderItem
                                    key={childName}
                                    name={childName}
                                    content={childContent}
                                    courseId={courseId}
                                    currentLessonId={currentLessonId}
                                    level={level + 1}
                                />
                            ))}

                        {/* Render Lessons (Sorted Alphabetically) */}
                        {hasLessons && (
                            <div className="space-y-1 mt-1 mb-2">
                                {content._lessons
                                    .sort((a, b) => a.title.localeCompare(b.title, 'vi', { numeric: true }))
                                    .map((lesson) => (
                                        <Link
                                            key={lesson.id}
                                            href={`/learn/${courseId}/${lesson.id}`}
                                            scroll={false} // Prevent full page scroll reset
                                            className={`
                      block py-2 pr-2 rounded-lg transition-all text-sm border-l-4
                      ${lesson.id === currentLessonId
                                                    ? 'bg-stone-200/80 dark:bg-zinc-800/80 text-primary font-semibold border-primary shadow-sm'
                                                    : 'border-transparent text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                                                }
                    `}
                                            style={{ paddingLeft: `${(level + 1) * 12 + 24}px` }}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="mt-0.5 shrink-0">
                                                    {lesson.is_completed ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : lesson.video_url || lesson.drive_file_id ? (
                                                        <Video className={`h-4 w-4 ${lesson.id === currentLessonId ? 'text-primary fill-primary/20' : ''}`} />
                                                    ) : (
                                                        <FileText className={`h-4 w-4 ${lesson.id === currentLessonId ? 'text-primary fill-primary/20' : ''}`} />
                                                    )}
                                                </div>
                                                <span className="line-clamp-2 leading-tight">{lesson.title}</span>
                                            </div>
                                        </Link>
                                    ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function LessonPlayer({
    currentLesson,
    allLessons,
    organizedLessons,
    course,
    user,
}: LessonPlayerProps) {
    const [isCompleting, setIsCompleting] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [iframeLoaded, setIframeLoaded] = useState(false)
    const router = useRouter()

    // Reset loading state when lesson changes
    useEffect(() => {
        setIframeLoaded(false)
    }, [currentLesson.id])

    // Flatten lessons based on sorted tree structure
    const sortedFlatLessons = useMemo(() => {
        const getSortedFlatLessons = (organized: OrganizedLessons): Lesson[] => {
            let lessons: Lesson[] = []

            const sortedFolders = Object.entries(organized).sort(([a], [b]) =>
                a.localeCompare(b, 'vi', { numeric: true })
            )

            for (const [_, content] of sortedFolders) {
                // 1. First, get lessons from current folder (before sub-folders)
                if (content._lessons) {
                    const sorted = [...content._lessons].sort((a, b) =>
                        a.title.localeCompare(b.title, 'vi', { numeric: true })
                    )
                    lessons = [...lessons, ...sorted]
                }

                // 2. Then, recursively get lessons from sub-folders
                if (content._children) {
                    lessons = [...lessons, ...getSortedFlatLessons(content._children)]
                }
            }
            return lessons
        }

        return getSortedFlatLessons(organizedLessons)
    }, [organizedLessons])

    const handleComplete = async () => {
        setIsCompleting(true)
        const result = await completeLesson(currentLesson.id)
        setIsCompleting(false)

        if (result.success) {
            router.refresh()
        }
    }

    const handleUncomplete = async () => {
        setIsCompleting(true)
        const result = await uncompleteLesson(currentLesson.id)
        setIsCompleting(false)

        if (result.success) {
            router.refresh()
        }
    }

    // Find next/prev lesson based on SORTED FLAT LIST
    const currentIndex = sortedFlatLessons.findIndex(l => l.id === currentLesson.id)
    const nextLesson = currentIndex < sortedFlatLessons.length - 1 ? sortedFlatLessons[currentIndex + 1] : null
    const prevLesson = currentIndex > 0 ? sortedFlatLessons[currentIndex - 1] : null

    // Calculate progress
    const completedLessons = allLessons.filter(l => l.is_completed).length
    const totalLessons = allLessons.length
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-border/50 shadow-sm flex items-center justify-between px-4 md:px-6 z-50 shrink-0">
                {/* Left: Logo & Breadcrumb */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Link href="/" className="flex items-center gap-2 shrink-0 group">
                        <div className="h-9 w-9 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                            <img src="/logo.svg" alt="AnAn Nihongo Logo" className="h-full w-full object-contain" />
                        </div>
                    </Link>
                    
                    {/* Breadcrumb */}
                    <nav className="hidden md:flex items-center gap-1 text-sm min-w-0">
                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                            <Home className="h-3.5 w-3.5" />
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-border shrink-0" />
                        <Link href="/learn" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Học</span>
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-border shrink-0" />
                        <Link href={`/learn/${course?.id}`} className="text-muted-foreground hover:text-primary transition-colors truncate max-w-[120px]">
                            {course?.title}
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-border shrink-0" />
                        <span className="text-heading font-medium truncate max-w-[150px]">{currentLesson.title}</span>
                    </nav>
                    
                    {/* Mobile: Course title */}
                    <span className="md:hidden font-medium text-sm text-heading truncate">{course?.title}</span>
                </div>

                {/* Center: Progress Bar (Desktop) */}
                <div className="hidden lg:flex items-center gap-3 px-4">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">Tiến độ</span>
                    </div>
                    <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                    <span className="text-xs font-semibold text-primary">{progressPercent}%</span>
                    <span className="text-xs text-muted-foreground">({completedLessons}/{totalLessons})</span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Progress Badge (Mobile) */}
                    <div className="lg:hidden flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-semibold text-primary">{progressPercent}%</span>
                    </div>
                    
                    {/* Profile Link */}
                    <Link 
                        href="/profile" 
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                        <User className="h-4 w-4" />
                        <span className="hidden xl:inline">Hồ sơ</span>
                    </Link>
                    
                    {/* Sidebar Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors lg:hidden"
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content (Player) */}
                <main className="flex-1 overflow-y-auto bg-black/5 relative">
                    <div className="container mx-auto px-2 py-2 max-w-[1600px] h-full flex flex-col">

                        {/* Video Player Container */}
                        <div className="flex-1 flex flex-col justify-center min-h-0">
                            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl ring-1 ring-border/50 w-full max-h-full relative group">

                                {/* Loading Spinner for Video */}
                                {!iframeLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-card/10 backdrop-blur-sm z-10">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative h-12 w-12">
                                                <motion.div
                                                    className="absolute inset-0"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                >
                                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="absolute w-2.5 h-2.5 rounded-full bg-primary"
                                                            style={{
                                                                top: 0,
                                                                left: "50%",
                                                                marginLeft: "-5px",
                                                                transformOrigin: "50% 24px",
                                                                transform: `rotate(${i * 60}deg)`,
                                                            }}
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{
                                                                duration: 1,
                                                                repeat: Infinity,
                                                                delay: i * 0.1,
                                                                repeatType: "reverse"
                                                            }}
                                                        />
                                                    ))}
                                                </motion.div>
                                            </div>
                                            <p className="text-xs font-medium text-white/80 animate-pulse">Đang tải Tài liệu...</p>
                                        </div>
                                    </div>
                                )}

                                <iframe
                                    src={`https://drive.google.com/file/d/${currentLesson.drive_file_id}/preview`}
                                    className={`w-full h-full transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    allow="autoplay"
                                    allowFullScreen
                                    onLoad={() => setIframeLoaded(true)}
                                />
                            </div>
                        </div>

                        {/* Compact Lesson Info & Controls */}
                        <div className="mt-3 bg-white rounded-xl p-4 border border-border/50 shadow-sm shrink-0">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                                {/* Left: Title & Info */}
                                <div className="flex-1 min-w-0 text-center md:text-left w-full">
                                    <h1 className="text-base font-bold text-heading truncate" title={currentLesson.title}>
                                        {currentLesson.title}
                                    </h1>
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-text-muted mt-1">
                                        {currentLesson.video_url || currentLesson.drive_file_id ? <Video className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                        <span>{currentLesson.video_url || currentLesson.drive_file_id ? 'Video' : 'PDF'}</span>
                                        <span className="text-border">|</span>
                                        <span>Bài {currentIndex + 1}</span>
                                    </div>
                                </div>

                                {/* Right: Controls */}
                                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-center">
                                    <Link
                                        href={prevLesson ? `/learn/${course.id}/${prevLesson.id}` : '#'}
                                        className={`btn-secondary h-9 px-3 text-xs gap-1 ${!prevLesson && 'opacity-50 pointer-events-none'}`}
                                        title="Bài trước"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="hidden sm:inline">Trước</span>
                                    </Link>

                                    {currentLesson.is_completed ? (
                                        <button
                                            onClick={handleUncomplete}
                                            disabled={isCompleting}
                                            className="btn-secondary h-9 px-4 text-xs gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="font-medium">Đã xong</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleComplete}
                                            disabled={isCompleting}
                                            className="btn-primary h-9 px-4 text-xs gap-2"
                                        >
                                            <Check className="h-4 w-4" />
                                            <span>{isCompleting ? '...' : 'Hoàn thành'}</span>
                                        </button>
                                    )}

                                    <Link
                                        href={nextLesson ? `/learn/${course.id}/${nextLesson.id}` : '#'}
                                        className={`btn-primary h-9 px-3 text-xs gap-1 ${!nextLesson && 'opacity-50 pointer-events-none'}`}
                                        title="Bài tiếp theo"
                                    >
                                        <span className="hidden sm:inline">Tiếp</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>

                {/* Sidebar (Lesson List) */}
                <AnimatePresence mode='wait'>
                    {sidebarOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="h-full bg-white border-l border-border/50 flex flex-col shrink-0 z-40 absolute lg:relative right-0 shadow-xl lg:shadow-md"
                        >
                            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-white sticky top-0 z-10 h-14">
                                <h2 className="font-bold text-base text-heading">Nội dung</h2>
                                <span className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                                    {allLessons.length} bài
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                                {Object.entries(organizedLessons)
                                    .sort(([a], [b]) => a.localeCompare(b, 'vi', { numeric: true }))
                                    .map(([folderName, content]) => (
                                        <FolderItem
                                            key={folderName}
                                            name={folderName}
                                            content={content}
                                            courseId={course.id}
                                            currentLessonId={currentLesson.id}
                                        />
                                    ))}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Chatbot with lesson context including video/file link */}
            <Chatbot 
                screenContext={`Khóa: ${course?.title?.slice(0, 30)}. Bài: ${currentLesson.title?.slice(0, 50)}. Link: https://drive.google.com/file/d/${currentLesson.drive_file_id}/view`}
            />
        </div>
    )
}
