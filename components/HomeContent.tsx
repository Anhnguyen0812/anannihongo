"use client"

import { motion } from "framer-motion"
import { BookOpen, ArrowRight, Users, Star, Target, Zap, Award } from "lucide-react"
import Link from "next/link"

import { useAuth } from "@/hooks/useAuth"

interface HomeContentProps {
    user?: any
}

export default function HomeContent({ user: propUser }: HomeContentProps) {
    const { data: authData } = useAuth()
    const user = propUser !== undefined ? propUser : authData?.user
    const courses = [
        { id: 6, title: "N5 - Nhập môn", subtitle: "Beginner", lessons: 48, duration: "3 tháng", students: 2340 },
        { id: 7, title: "N4 - Sơ cấp", subtitle: "Elementary", lessons: 56, duration: "4 tháng", students: 1890 },
        { id: 8, title: "N3 - Trung cấp", subtitle: "Intermediate", lessons: 64, duration: "5 tháng", students: 1250 },
        { id: 9, title: "N2 - Cao cấp", subtitle: "Advanced", lessons: 72, duration: "6 tháng", students: 890 },
    ]

    const features = [
        { icon: BookOpen, title: "Khóa học bài bản", desc: "Lộ trình từ N5 đến N2, được thiết kế khoa học" },
        { icon: Target, title: "Ngữ pháp chi tiết", desc: "Giải thích rõ ràng kèm ví dụ thực tế" },
        { icon: Zap, title: "Luyện tập Quiz", desc: "Bài tập tương tác giúp ghi nhớ lâu" },
        { icon: Award, title: "Chứng nhận JLPT", desc: "Chuẩn bị thi JLPT với đề thi thử" },
    ]

    const stats = [
        { value: "6,000+", label: "Học viên" },
        { value: "1,000+", label: "Bài học" },
        { value: "4.9/5", label: "Đánh giá" },
        { value: "95%", label: "Đỗ JLPT" },
    ]

    return (
        <>
            {/* Hero Section */}
            <section className="py-20 md:py-28">
                <div className="zen-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium">
                            🎌 Chào mừng đến với AnAn Nihongo
                        </span>

                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
                            <span className="block jp-text text-indigo-600 mb-2">日本語を学ぼう</span>
                            Học tiếng Nhật thật dễ dàng
                        </h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mx-auto mb-8 max-w-xl text-lg text-zinc-600 leading-relaxed"
                        >
                            Trải nghiệm phương pháp học hiện đại với hàng ngàn bài học tương tác.
                            Bắt đầu hành trình chinh phục JLPT ngay hôm nay!
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                        >
                            <Link href={user ? "/learn" : "/login"}>
                                <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
                                    {user ? "Tiếp tục học" : "Bắt đầu miễn phí"}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </Link>
                            {!user && (
                                <Link href="/about">
                                    <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                                        Xem giới thiệu
                                    </button>
                                </Link>
                            )}
                        </motion.div>

                        {/* Stats inline */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-12 flex items-center justify-center gap-8 flex-wrap"
                        >
                            {stats.map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
                                    <div className="text-sm text-zinc-500">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-zinc-50/50">
                <div className="zen-container">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-zinc-900">Tại sao chọn AnAn Nihongo?</h2>
                        <p className="text-zinc-500 mt-2">Phương pháp học hiện đại, hiệu quả</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group rounded-xl bg-white p-6 border border-zinc-200 hover:border-indigo-200 hover:shadow-md transition-all"
                            >
                                <div className="mb-4 inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                    <feature.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-zinc-900 mb-1">{feature.title}</h3>
                                <p className="text-sm text-zinc-500">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Courses */}
            <section className="py-16">
                <div className="zen-container">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-zinc-900">Khóa học JLPT</h2>
                        <p className="text-zinc-500 mt-2">Chọn cấp độ phù hợp với bạn</p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {courses.map((course, idx) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Link href={`/learn/${course.id}`}>
                                    <div className="group rounded-xl border border-zinc-200 bg-white p-6 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                {course.subtitle}
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <h3 className="font-semibold text-zinc-900 text-lg group-hover:text-indigo-600 transition-colors">
                                            {course.title}
                                        </h3>
                                        <div className="mt-4 space-y-2 text-sm text-zinc-500">
                                            <div className="flex items-center justify-between">
                                                <span>Bài học</span>
                                                <span className="font-medium text-zinc-700">{course.lessons}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Thời gian</span>
                                                <span className="font-medium text-zinc-700">{course.duration}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-1.5 text-xs text-zinc-400">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>{course.students.toLocaleString('vi-VN')} học viên</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA - White background */}
            <section className="py-16 border-t border-zinc-100">
                <div className="zen-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto text-center"
                    >
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">
                            Sẵn sàng bắt đầu hành trình?
                        </h2>
                        <p className="text-zinc-600 mb-8">
                            Tham gia cùng hàng ngàn học viên đang chinh phục tiếng Nhật mỗi ngày.
                            Đăng ký miễn phí, không cần thẻ tín dụng.
                        </p>
                        <Link href={user ? "/learn" : "/register"}>
                            <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
                                {user ? "Vào học ngay" : "Đăng ký miễn phí"}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-100 bg-zinc-50/50 py-8">
                <div className="zen-container">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-zinc-400 text-center w-full">Iu manh 💖💞💞💖</p>
                    </div>
                </div>
            </footer>
        </>
    )
}
