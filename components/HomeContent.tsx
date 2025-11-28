"use client"

import { motion } from "framer-motion"
import { BookOpen, Sparkles, Target, Zap, Award, ArrowRight } from "lucide-react"
import Link from "next/link"

interface HomeContentProps {
    user?: any
}

export default function HomeContent({ user }: HomeContentProps) {
    const features = [
        {
            icon: BookOpen,
            title: "Khóa học bài bản",
            subtitle: "Learning Courses",
            description: "Lộ trình học tập từ sơ cấp đến nâng cao",
        },
        {
            icon: Sparkles,
            title: "Hán tự Master",
            subtitle: "Kanji Master",
            description: "Chinh phục Kanji với phương pháp lặp lại ngắt quãng",
        },
        {
            icon: Target,
            title: "Ngữ pháp chi tiết",
            subtitle: "Grammar Guide",
            description: "Giải thích ngữ pháp chi tiết kèm ví dụ thực tế",
        },
        {
            icon: Zap,
            title: "Luyện tập Quiz",
            subtitle: "Quiz Practice",
            description: "Bài tập tương tác giúp ghi nhớ kiến thức lâu hơn",
        },
    ]

    return (
        <>
            {/* Hero Section */}
            <section className="zen-section">
                <div className="zen-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mx-auto max-w-4xl text-center"
                    >
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                            <Sparkles className="h-4 w-4" />
                            <span>Chào mừng đến với AnAn Nihongo</span>
                        </div>

                        <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                            <span className="jp-text block text-primary">日本語を学ぼう</span>
                            <span className="mt-2 block">Chinh phục tiếng Nhật</span>
                        </h1>

                        <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                            Trải nghiệm phương pháp học tiếng Nhật tối giản, hiệu quả và đầy cảm hứng.
                            Thiết kế tinh tế kết hợp cùng công cụ học tập mạnh mẽ.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href={user ? "/learn" : "/login"}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-primary w-full sm:w-auto flex items-center gap-2"
                                >
                                    {user ? "Tiếp tục học" : "Bắt đầu ngay"}
                                    <ArrowRight className="h-4 w-4" />
                                </motion.button>
                            </Link>
                            {!user && (
                                <Link href="/about">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn-accent w-full sm:w-auto"
                                    >
                                        Tìm hiểu thêm
                                    </motion.button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="zen-section bg-card">
                <div className="zen-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                            Tính năng nổi bật
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Mọi thứ bạn cần để làm chủ tiếng Nhật
                        </p>
                    </motion.div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="zen-card group"
                            >
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-1 text-xl font-semibold text-foreground">
                                    {feature.title}
                                </h3>
                                <p className="mb-2 text-sm font-medium text-primary">
                                    {feature.subtitle}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section with Glassmorphism */}
            <section className="zen-section relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5" />
                <div className="zen-container relative">
                    <div className="glass-card rounded-3xl p-8 sm:p-12">
                        <div className="grid gap-8 sm:grid-cols-3">
                            {[
                                { value: "5000+", label: "Từ vựng", jp: "語彙" },
                                { value: "2136", label: "Hán tự", jp: "漢字" },
                                { value: "100+", label: "Ngữ pháp", jp: "文法" },
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">
                                        {stat.value}
                                    </div>
                                    <div className="mb-1 text-sm font-medium text-foreground">
                                        {stat.label}
                                    </div>
                                    <div className="jp-text text-xs text-muted-foreground">
                                        {stat.jp}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="zen-section bg-card">
                <div className="zen-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 text-center text-primary-foreground sm:p-16"
                    >
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

                        <div className="relative">
                            <Award className="mx-auto mb-6 h-16 w-16" />
                            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                                Sẵn sàng bắt đầu hành trình?
                            </h2>
                            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
                                Tham gia cùng hàng ngàn học viên đang chinh phục tiếng Nhật mỗi ngày.
                            </p>
                            <Link href={user ? "/learn" : "/login"}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="rounded-xl bg-white px-8 py-4 font-semibold text-primary shadow-xl transition-shadow hover:shadow-2xl"
                                >
                                    {user ? "Vào học ngay" : "Đăng ký miễn phí"}
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-card py-12">
                <div className="zen-container">
                    <div className="text-center text-sm text-muted-foreground">
                        <p className="mb-2 jp-text">日本語マスター © 2024</p>
                        <p>Designed with ❤️ for Japanese learners</p>
                    </div>
                </div>
            </footer>
        </>
    )
}
