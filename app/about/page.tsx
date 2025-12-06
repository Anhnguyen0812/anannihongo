import Link from 'next/link'
import { ArrowRight, Star, Users, Zap, Globe, Home, BookOpen, Heart, Sparkles, Target, Award, CheckCircle2, GraduationCap, TrendingUp, Rocket } from 'lucide-react'
import ChatbotWrapper from '@/components/ChatbotWrapper'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white">
            {/* Header Navigation */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
                <div className="zen-container">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="h-10 w-10 rounded-xl overflow-hidden group-hover:scale-110 transition-transform">
                                <img src="/logo.svg" alt="AnAn Nihongo" className="h-full w-full object-contain" />
                            </div>
                            <span className="font-bold text-lg text-gray-800 hidden sm:block">AnAn Nihongo</span>
                        </Link>
                        
                        {/* Navigation */}
                        <nav className="flex items-center gap-2">
                            <Link 
                                href="/"
                                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                            >
                                <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span className="hidden sm:inline">Trang chủ</span>
                            </Link>
                            <Link 
                                href="/login"
                                className="clay-button flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                            >
                                <Rocket className="h-4 w-4" />
                                <span>Bắt đầu học</span>
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full blur-3xl opacity-40 animate-float" />
                    <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-40" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-200 to-purple-200 rounded-full blur-3xl opacity-30" />
                </div>

                <div className="zen-container text-center">
                    <span className="inline-flex items-center gap-2 clay-badge bg-gradient-to-r from-violet-100 to-pink-100 text-violet-700 mb-8">
                        <span className="text-xl">🎌</span>
                        <span className="font-semibold">Về chúng tôi</span>
                        <Sparkles className="h-4 w-4 text-pink-500" />
                    </span>
                    
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-8">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">AnAn Nihongo</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Nền tảng học tiếng Nhật trực tuyến hiện đại, giúp bạn chinh phục JLPT một cách 
                        <span className="font-semibold text-indigo-600"> hiệu quả</span> và 
                        <span className="font-semibold text-pink-500"> thú vị</span> nhất!
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-white">
                <div className="zen-container">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <span className="inline-flex items-center gap-2 clay-badge bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700">
                                <Target className="h-4 w-4" />
                                <span className="font-semibold">Sứ mệnh</span>
                            </span>
                            <h2 className="text-3xl font-extrabold text-gray-800">
                                Học tiếng Nhật phải <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">vui</span>
                            </h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Chúng tôi tin rằng việc học ngoại ngữ không nên nhàm chán hay quá áp lực. AnAn Nihongo được xây dựng với mục tiêu mang lại trải nghiệm học tập:
                            </p>
                            <ul className="space-y-4">
                                {[
                                    { text: 'Trực quan và sinh động với video chất lượng cao', icon: '🎬' },
                                    { text: 'Lộ trình học tập rõ ràng, được cá nhân hóa', icon: '🗺️' },
                                    { text: 'Cộng đồng hỗ trợ nhiệt tình, cùng nhau tiến bộ', icon: '👥' },
                                    { text: 'Công nghệ hiện đại giúp theo dõi tiến độ chính xác', icon: '📊' }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 clay-card p-4 hover:scale-[1.02] transition-transform cursor-default">
                                        <span className="text-2xl">{item.icon}</span>
                                        <span className="text-gray-700 font-medium">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="clay-card aspect-square rounded-3xl flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                                <div className="relative text-center p-8">
                                    <span className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 jp-text block mb-4">日本</span>
                                    <span className="text-2xl font-bold text-gray-600">Nihon</span>
                                </div>
                                {/* Floating decorations */}
                                <div className="absolute top-10 left-10 text-4xl animate-bounce-soft">🌸</div>
                                <div className="absolute bottom-10 right-10 text-4xl animate-bounce-soft" style={{ animationDelay: '0.5s' }}>🗾</div>
                                <div className="absolute top-1/2 right-10 text-3xl animate-bounce-soft" style={{ animationDelay: '1s' }}>⛩️</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-b from-white to-indigo-50/50">
                <div className="zen-container">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 clay-badge bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 mb-6">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-semibold">Thành tựu</span>
                        </span>
                        <h2 className="text-3xl font-extrabold text-gray-800">
                            Con số <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">ấn tượng</span>
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Users, label: 'Học viên', value: '10,000+', color: 'from-blue-400 to-indigo-500', bgColor: 'from-blue-50 to-indigo-50', emoji: '👨‍🎓' },
                            { icon: Star, label: 'Đánh giá', value: '4.9/5', color: 'from-amber-400 to-orange-500', bgColor: 'from-amber-50 to-orange-50', emoji: '⭐' },
                            { icon: Zap, label: 'Bài học', value: '1,000+', color: 'from-purple-400 to-pink-500', bgColor: 'from-purple-50 to-pink-50', emoji: '📚' },
                            { icon: Globe, label: 'Quốc gia', value: '15+', color: 'from-emerald-400 to-teal-500', bgColor: 'from-emerald-50 to-teal-50', emoji: '🌏' },
                        ].map((stat, i) => (
                            <div key={i} className="clay-card text-center p-6 group hover:scale-105 transition-all duration-300">
                                <div className={`mx-auto clay-icon w-16 h-16 flex items-center justify-center mb-4 bg-gradient-to-br ${stat.bgColor}`}>
                                    <span className="text-3xl group-hover:scale-110 transition-transform">{stat.emoji}</span>
                                </div>
                                <div className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${stat.color} mb-1`}>{stat.value}</div>
                                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-white">
                <div className="zen-container">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 clay-badge bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 mb-6">
                            <Heart className="h-4 w-4" />
                            <span className="font-semibold">Tại sao chọn chúng tôi?</span>
                        </span>
                        <h2 className="text-3xl font-extrabold text-gray-800">
                            Điều làm nên <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">sự khác biệt</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Phương pháp khoa học',
                                description: 'Áp dụng spaced repetition và active recall để giúp bạn ghi nhớ lâu hơn',
                                icon: '🧠',
                                color: 'from-violet-100 to-purple-100'
                            },
                            {
                                title: 'Nội dung chất lượng',
                                description: 'Video HD, giáo trình được biên soạn bởi giáo viên người Nhật',
                                icon: '🎯',
                                color: 'from-blue-100 to-cyan-100'
                            },
                            {
                                title: 'Học mọi lúc mọi nơi',
                                description: 'Truy cập trên mọi thiết bị, đồng bộ tiến độ tự động',
                                icon: '📱',
                                color: 'from-emerald-100 to-teal-100'
                            }
                        ].map((item, i) => (
                            <div key={i} className={`clay-card p-8 text-center bg-gradient-to-br ${item.color} group hover:scale-105 transition-all duration-300`}>
                                <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform">{item.icon}</span>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 text-center">
                <div className="zen-container">
                    <div className="clay-card bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 relative overflow-hidden"
                         style={{ boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.4)' }}>
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
                        </div>
                        
                        <div className="relative">
                            <span className="text-6xl mb-6 block">🚀</span>
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-white">
                                Sẵn sàng bắt đầu hành trình?
                            </h2>
                            <p className="text-white/90 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
                                Tham gia ngay hôm nay để truy cập kho tài liệu khổng lồ và bắt đầu chinh phục tiếng Nhật!
                            </p>
                            <Link href="/login">
                                <button className="group clay-button bg-white text-indigo-600 font-bold px-10 py-5 text-lg inline-flex items-center gap-3">
                                    <GraduationCap className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                    <span>Đăng ký miễn phí</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <p className="mt-6 text-sm text-white/70">
                                ✓ Không cần thẻ tín dụng &nbsp;•&nbsp; ✓ 7 ngày dùng thử miễn phí
                            </p>
                        </div>
                    </div>
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

            <ChatbotWrapper screenContext="Trang giới thiệu về AnAn Nihongo - Nền tảng học tiếng Nhật" />
        </div>
    )
}
