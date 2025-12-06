import Link from 'next/link'
import { ArrowRight, Home, BookOpen, Target, Zap, Award, Users, Star } from 'lucide-react'
import ChatbotWrapper from '@/components/ChatbotWrapper'

export default function AboutPage() {
    const features = [
        { icon: BookOpen, title: 'Lộ trình bài bản', desc: 'Từ N5 đến N2, được thiết kế theo chuẩn JLPT' },
        { icon: Target, title: 'Nội dung chất lượng', desc: 'Video HD, giáo trình được biên soạn kỹ lưỡng' },
        { icon: Zap, title: 'Học tương tác', desc: 'Quiz, flashcard giúp ghi nhớ hiệu quả' },
        { icon: Award, title: 'Đề thi thử', desc: 'Luyện đề JLPT với đáp án chi tiết' },
    ]

    const stats = [
        { value: '6,000+', label: 'Học viên' },
        { value: '1,000+', label: 'Bài học' },
        { value: '4.9/5', label: 'Đánh giá' },
    ]

    const missions = [
        'Video bài giảng chất lượng cao, dễ hiểu',
        'Lộ trình học tập rõ ràng, phù hợp mọi trình độ',
        'Bài tập tương tác giúp ghi nhớ lâu hơn',
        'Theo dõi tiến độ học tập chính xác',
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-100">
                <div className="zen-container">
                    <div className="flex items-center justify-between h-14">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logo.svg" alt="AnAn Nihongo" className="h-8 w-8" />
                            <span className="font-semibold text-zinc-900">AnAn Nihongo</span>
                        </Link>

                        <nav className="flex items-center gap-2">
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                            >
                                <Home className="h-4 w-4" />
                                <span className="hidden sm:inline">Trang chủ</span>
                            </Link>
                            <Link
                                href="/login"
                                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                            >
                                Bắt đầu học
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="py-20 md:py-28">
                <div className="zen-container text-center">
                    <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium">
                        🎌 Về chúng tôi
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-6">
                        <span className="block jp-text text-indigo-600 mb-2">AnAn Nihongo</span>
                        Nền tảng học tiếng Nhật trực tuyến
                    </h1>
                    <p className="text-zinc-600 max-w-xl mx-auto text-lg leading-relaxed">
                        Giúp bạn chinh phục JLPT một cách hiệu quả với phương pháp học tập hiện đại và khoa học.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 bg-zinc-50/50">
                <div className="zen-container">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900 mb-4">
                                Học tiếng Nhật phải vui và hiệu quả
                            </h2>
                            <p className="text-zinc-600 mb-6 leading-relaxed">
                                Chúng tôi tin rằng việc học ngoại ngữ không nên nhàm chán. AnAn Nihongo mang đến trải nghiệm học tập:
                            </p>
                            <ul className="space-y-3">
                                {missions.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-zinc-700">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-center">
                            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-zinc-50 p-12 border border-zinc-100">
                                <span className="text-7xl font-bold jp-text text-indigo-600 block text-center">日本</span>
                                <span className="text-xl font-medium text-zinc-500 block text-center mt-2">Nihon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16">
                <div className="zen-container">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-zinc-900">Điều làm nên sự khác biệt</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((item, i) => (
                            <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-indigo-200 hover:shadow-md transition-all">
                                <div className="mb-4 inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-zinc-900 mb-1">{item.title}</h3>
                                <p className="text-sm text-zinc-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-zinc-50/50">
                <div className="zen-container">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-zinc-900">Thành tựu của chúng tôi</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center rounded-xl border border-zinc-200 bg-white p-6">
                                <div className="text-3xl font-bold text-indigo-600 mb-1">{stat.value}</div>
                                <div className="text-sm text-zinc-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 border-t border-zinc-100">
                <div className="zen-container text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">
                        Sẵn sàng bắt đầu hành trình?
                    </h2>
                    <p className="text-zinc-600 mb-8 max-w-md mx-auto">
                        Tham gia ngay để truy cập kho tài liệu và bắt đầu chinh phục tiếng Nhật!
                    </p>
                    <Link href="/register">
                        <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
                            Đăng ký miễn phí
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </Link>
                    <p className="mt-4 text-sm text-zinc-400">
                        Không cần thẻ tín dụng • 7 ngày dùng thử miễn phí
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-100 bg-zinc-50/50 py-8">
                <div className="zen-container">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo.svg" alt="AnAn Nihongo" className="h-8 w-8" />
                            <span className="font-semibold text-zinc-900">AnAn Nihongo</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-zinc-500">
                            <Link href="/" className="hover:text-zinc-900 transition-colors">Trang chủ</Link>
                            <Link href="/courses" className="hover:text-zinc-900 transition-colors">Khóa học</Link>
                            <Link href="/contact" className="hover:text-zinc-900 transition-colors">Liên hệ</Link>
                        </div>
                        <p className="text-sm text-zinc-400">© 2024 AnAn Nihongo</p>
                    </div>
                </div>
            </footer>

            <ChatbotWrapper screenContext="Trang giới thiệu về AnAn Nihongo" />
        </div>
    )
}
