"use client"

import { motion } from "framer-motion"
import { BookOpen, Sparkles, Target, Zap, Award, ArrowRight, Play, Star, TrendingUp, Users, CheckCircle2, Quote, Rocket, Heart, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface HomeContentProps {
    user?: any
}

export default function HomeContent({ user }: HomeContentProps) {
    const [activeProgress, setActiveProgress] = useState(0)

    const courses = [
        {
            id: 1,
            title: "N5 - Nhập môn",
            subtitle: "Beginner",
            lessons: 48,
            duration: "3 tháng",
            color: "from-emerald-400 to-teal-500",
            icon: "🌱",
            students: 2340,
        },
        {
            id: 2,
            title: "N4 - Sơ cấp",
            subtitle: "Elementary",
            lessons: 56,
            duration: "4 tháng",
            color: "from-blue-400 to-indigo-500",
            icon: "📚",
            students: 1890,
        },
        {
            id: 3,
            title: "N3 - Trung cấp",
            subtitle: "Intermediate",
            lessons: 64,
            duration: "5 tháng",
            color: "from-purple-400 to-pink-500",
            icon: "🎯",
            students: 1250,
        },
        {
            id: 4,
            title: "N2 - Cao cấp",
            subtitle: "Advanced",
            lessons: 72,
            duration: "6 tháng",
            color: "from-orange-400 to-red-500",
            icon: "🏆",
            students: 890,
        },
    ]

    const progressDemo = [
        { skill: "Từ vựng", progress: 78, color: "from-pink-400 to-rose-500", icon: "📝" },
        { skill: "Hán tự", progress: 65, color: "from-violet-400 to-purple-500", icon: "漢" },
        { skill: "Ngữ pháp", progress: 82, color: "from-cyan-400 to-blue-500", icon: "📖" },
        { skill: "Nghe", progress: 54, color: "from-amber-400 to-orange-500", icon: "🎧" },
    ]

    const testimonials = [
        {
            name: "Minh Anh",
            avatar: "🧑‍🎓",
            role: "Sinh viên ĐH Ngoại thương",
            content: "Nhờ AnAn Nihongo mà mình đã đỗ N3 chỉ sau 8 tháng học! Phương pháp học rất dễ hiểu và thú vị.",
            rating: 5,
            color: "from-rose-100 to-pink-100",
        },
        {
            name: "Hữu Đức",
            avatar: "👨‍💻",
            role: "Kỹ sư IT tại Nhật",
            content: "Giao diện đẹp, bài học chất lượng. Học ở đây giúp mình tự tin giao tiếp với đồng nghiệp người Nhật.",
            rating: 5,
            color: "from-blue-100 to-indigo-100",
        },
        {
            name: "Thu Hà",
            avatar: "👩‍🏫",
            role: "Giáo viên tiểu học",
            content: "Mình rất thích cách giải thích ngữ pháp ở đây. Dễ nhớ và có nhiều ví dụ thực tế!",
            rating: 5,
            color: "from-emerald-100 to-teal-100",
        },
    ]

    const features = [
        {
            icon: BookOpen,
            title: "Khóa học bài bản",
            description: "Lộ trình học tập từ sơ cấp đến nâng cao",
            color: "from-blue-400 to-cyan-400",
            bgColor: "bg-blue-50",
        },
        {
            icon: Sparkles,
            title: "Hán tự Master",
            description: "Chinh phục Kanji với phương pháp khoa học",
            color: "from-purple-400 to-pink-400",
            bgColor: "bg-purple-50",
        },
        {
            icon: Target,
            title: "Ngữ pháp chi tiết",
            description: "Giải thích rõ ràng kèm ví dụ thực tế",
            color: "from-emerald-400 to-teal-400",
            bgColor: "bg-emerald-50",
        },
        {
            icon: Zap,
            title: "Luyện tập Quiz",
            description: "Bài tập tương tác giúp ghi nhớ lâu hơn",
            color: "from-orange-400 to-amber-400",
            bgColor: "bg-orange-50",
        },
    ]

    return (
        <>
            {/* Hero Section - Playful & Vibrant */}
            <section className="py-16 md:py-24 lg:py-28 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full blur-3xl opacity-40 animate-float" />
                    <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-40 animate-float" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-200 to-purple-200 rounded-full blur-3xl opacity-30" />
                </div>

                <div className="zen-container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mx-auto max-w-4xl text-center"
                    >
                        {/* Playful badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="mb-8 inline-flex items-center gap-3 clay-badge bg-gradient-to-r from-violet-100 to-pink-100 text-violet-700"
                        >
                            <span className="text-xl animate-wiggle inline-block">🎌</span>
                            <span className="font-semibold">Chào mừng đến với AnAn Nihongo</span>
                            <Sparkles className="h-4 w-4 text-pink-500" />
                        </motion.div>

                        <h1 className="mb-8 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 jp-text"
                            >
                                日本語を学ぼう
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-4 block text-gray-800"
                            >
                                Học tiếng Nhật <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">thật vui!</span>
                            </motion.span>
                        </h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl"
                        >
                            Trải nghiệm phương pháp học hiện đại, thú vị với hàng ngàn bài học tương tác.
                            <span className="font-semibold text-indigo-600"> Bắt đầu hành trình chinh phục JLPT ngay hôm nay!</span>
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                        >
                            <Link href={user ? "/learn" : "/login"}>
                                <button className="group relative inline-flex items-center justify-center gap-3 clay-button bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-base font-bold text-white">
                                    <Rocket className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    <span>{user ? "Tiếp tục học" : "Bắt đầu miễn phí"}</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            {!user && (
                                <Link href="/about">
                                    <button className="group inline-flex items-center justify-center gap-3 clay-button bg-white px-8 py-4 text-base font-bold text-gray-700 border-2 border-gray-100">
                                        <Play className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                                        <span>Xem giới thiệu</span>
                                    </button>
                                </Link>
                            )}
                        </motion.div>

                        {/* Quick stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {['🧑‍🎓', '👩‍💻', '👨‍🎓', '👩‍🎓'].map((emoji, i) => (
                                        <span key={i} className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-center leading-8 ring-2 ring-white">
                                            {emoji}
                                        </span>
                                    ))}
                                </div>
                                <span className="font-medium">10,000+ học viên</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <span className="font-medium">4.9/5 đánh giá</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Course Catalog Preview */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-white to-indigo-50/50">
                <div className="zen-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <span className="inline-flex items-center gap-2 clay-badge bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 mb-6">
                            <GraduationCap className="h-4 w-4" />
                            <span className="font-semibold">Khóa học JLPT</span>
                        </span>
                        <h2 className="text-3xl font-extrabold text-gray-800 sm:text-4xl mb-4">
                            Lộ trình học <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">đầy đủ</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Từ N5 đến N1, chúng tôi có tất cả những gì bạn cần để chinh phục JLPT
                        </p>
                    </motion.div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="clay-card group cursor-pointer overflow-hidden"
                            >
                                {/* Card header with gradient */}
                                <div className={`bg-gradient-to-br ${course.color} p-6 text-white relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 text-6xl opacity-30 transform translate-x-2 -translate-y-2">
                                        {course.icon}
                                    </div>
                                    <span className="text-4xl mb-2 block">{course.icon}</span>
                                    <h3 className="text-xl font-bold">{course.title}</h3>
                                    <p className="text-white/80 text-sm">{course.subtitle}</p>
                                </div>

                                {/* Card body */}
                                <div className="p-5">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                        <span className="flex items-center gap-1.5">
                                            <BookOpen className="h-4 w-4 text-indigo-500" />
                                            {course.lessons} bài học
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                                            {course.duration}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                        <Users className="h-4 w-4" />
                                        <span>{course.students.toLocaleString('vi-VN')} học viên</span>
                                    </div>
                                    <button className="w-full py-2.5 px-4 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-300">
                                        Xem chi tiết →
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid - Claymorphism Style */}
            <section className="py-20 md:py-28 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(147,51,234,0.05),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

                <div className="zen-container relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <span className="inline-flex items-center gap-2 clay-badge bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 mb-6">
                            <Sparkles className="h-4 w-4" />
                            <span className="font-semibold">Tính năng nổi bật</span>
                        </span>
                        <h2 className="text-3xl font-extrabold text-gray-800 sm:text-4xl mb-4">
                            Mọi thứ bạn cần để <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">thành công</span>
                        </h2>
                    </motion.div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30, rotate: -2 }}
                                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                                className="clay-card p-6 text-center group"
                            >
                                <div className={`clay-icon ${feature.bgColor} mx-auto mb-5 w-16 h-16 flex items-center justify-center`}>
                                    <feature.icon className={`h-8 w-8 text-transparent bg-clip-text bg-gradient-to-r ${feature.color}`} style={{ stroke: 'url(#icon-gradient)' }} />
                                    <svg width="0" height="0">
                                        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#818cf8" />
                                            <stop offset="100%" stopColor="#e879f9" />
                                        </linearGradient>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Progress Tracking Demo */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-indigo-50/50 to-white">
                <div className="zen-container">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-flex items-center gap-2 clay-badge bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 mb-6">
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-semibold">Theo dõi tiến độ</span>
                            </span>
                            <h2 className="text-3xl font-extrabold text-gray-800 sm:text-4xl mb-6">
                                Biết rõ bạn đang ở <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">đâu</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Hệ thống theo dõi tiến độ thông minh giúp bạn nắm rõ điểm mạnh, điểm yếu và
                                đề xuất bài học phù hợp nhất.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Phân tích chi tiết từng kỹ năng",
                                    "Gợi ý bài học cá nhân hóa",
                                    "Thống kê thời gian học tập",
                                    "So sánh với cộng đồng học viên"
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                        <span className="text-gray-700">{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="clay-card p-6 md:p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Tiến độ của bạn</h3>
                                <span className="clay-badge bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm">
                                    Tuần này: +12%
                                </span>
                            </div>

                            <div className="space-y-5">
                                {progressDemo.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{item.icon}</span>
                                                <span className="font-medium text-gray-700">{item.skill}</span>
                                            </div>
                                            <span className="font-bold text-gray-800">{item.progress}%</span>
                                        </div>
                                        <div className="clay-progress h-3">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${item.progress}%` }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                                                className={`clay-progress-fill bg-gradient-to-r ${item.color}`}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-indigo-600">156</div>
                                        <div className="text-xs text-gray-500">Bài đã học</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-pink-500">23h</div>
                                        <div className="text-xs text-gray-500">Thời gian học</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-emerald-500">12</div>
                                        <div className="text-xs text-gray-500">Ngày streak</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Student Testimonials */}
            <section className="py-20 md:py-28 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-pink-100 rounded-full blur-2xl opacity-60" />
                    <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-100 rounded-full blur-2xl opacity-60" />
                </div>

                <div className="zen-container relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <span className="inline-flex items-center gap-2 clay-badge bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 mb-6">
                            <Heart className="h-4 w-4" />
                            <span className="font-semibold">Học viên nói gì</span>
                        </span>
                        <h2 className="text-3xl font-extrabold text-gray-800 sm:text-4xl mb-4">
                            Được <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">10,000+</span> học viên tin tưởng
                        </h2>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30, rotate: index % 2 === 0 ? -2 : 2 }}
                                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                                className={`testimonial-card bg-gradient-to-br ${testimonial.color}`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-4xl">{testimonial.avatar}</span>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <Quote className="h-6 w-6 text-gray-300 mb-2" />
                                <p className="text-gray-700 leading-relaxed">
                                    {testimonial.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Enrollment */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-indigo-50/30 to-white">
                <div className="zen-container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-10 md:p-16 text-center text-white"
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset'
                        }}
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-pink-400/30 rounded-full blur-xl" />
                        </div>

                        <div className="relative">
                            <motion.span
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="text-6xl mb-6 block"
                            >
                                🚀
                            </motion.span>
                            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
                                Sẵn sàng bắt đầu hành trình?
                            </h2>
                            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 leading-relaxed">
                                Đăng ký ngay hôm nay và nhận <span className="font-bold text-amber-300">7 ngày dùng thử miễn phí</span>.
                                Khám phá hàng ngàn bài học chất lượng cao!
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href={user ? "/learn" : "/login"}>
                                    <button className="group clay-button bg-white text-indigo-600 px-10 py-5 text-lg font-bold inline-flex items-center gap-3">
                                        <Award className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                        <span>{user ? "Vào học ngay" : "Đăng ký miễn phí"}</span>
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            </div>
                            <p className="mt-6 text-sm text-white/70">
                                ✓ Không cần thẻ tín dụng &nbsp;•&nbsp; ✓ Hủy bất cứ lúc nào
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white py-12">
                <div className="zen-container">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <span className="text-2xl">🎌</span>
                            <span className="font-bold text-lg text-gray-800">AnAn Nihongo</span>
                        </div>
                        <p className="text-gray-500">Iu Manh 💖💖💖</p>
                    </div>
                </div>
            </footer>
        </>
    )
}
