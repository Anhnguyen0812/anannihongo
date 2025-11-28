import Link from 'next/link'
import { ArrowRight, Star, Users, Zap, Globe } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
                <div className="zen-container text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Về <span className="text-primary">AnAn Nihongo</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Nền tảng học tiếng Nhật trực tuyến hiện đại, giúp bạn chinh phục JLPT một cách hiệu quả và thú vị nhất.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16">
                <div className="zen-container">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Sứ mệnh của chúng tôi</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Chúng tôi tin rằng việc học ngoại ngữ không nên nhàm chán hay quá áp lực. AnAn Nihongo được xây dựng với mục tiêu mang lại trải nghiệm học tập:
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Trực quan và sinh động với video chất lượng cao.',
                                    'Lộ trình học tập rõ ràng, được cá nhân hóa.',
                                    'Cộng đồng hỗ trợ nhiệt tình, cùng nhau tiến bộ.',
                                    'Công nghệ hiện đại giúp theo dõi tiến độ chính xác.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <CheckIcon />
                                        </div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center relative overflow-hidden glass-card">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-overlay" />
                                <span className="text-9xl font-bold text-primary/20 jp-text">日本</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-primary/5">
                <div className="zen-container">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: Users, label: 'Học viên', value: '10,000+' },
                            { icon: Star, label: 'Đánh giá', value: '4.9/5' },
                            { icon: Zap, label: 'Bài học', value: '1,000+' },
                            { icon: Globe, label: 'Quốc gia', value: '15+' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center space-y-2">
                                <div className="mx-auto h-12 w-12 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 text-center">
                <div className="zen-container">
                    <div className="glass-card rounded-3xl p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 -z-10" />
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Sẵn sàng bắt đầu hành trình?
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                            Tham gia ngay hôm nay để truy cập kho tài liệu khổng lồ và bắt đầu chinh phục tiếng Nhật.
                        </p>
                        <Link href="/login">
                            <button className="btn-primary text-lg px-8 py-3">
                                Đăng ký miễn phí <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

function CheckIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
