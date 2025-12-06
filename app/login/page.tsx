"use client"

import { motion } from "framer-motion"
import { Chrome, Sparkles, ArrowLeft, Mail, Lock, User, Loader2 } from "lucide-react"
import { loginWithGoogle, loginWithEmail, signUpWithEmail } from "./actions"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const redirectTo = searchParams.get('redirectTo')
    const signupParam = searchParams.get('signup')

    const [isSignUp, setIsSignUp] = useState(signupParam === 'true')
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)

    const handleEmailSubmit = () => {
        setIsLoading(true)
    }

    const handleGoogleSubmit = () => {
        setIsGoogleLoading(true)
        // Save rememberMe preference to localStorage before redirecting to Google
        if (typeof window !== 'undefined') {
            localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false')
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Back to home link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Về trang chủ</span>
                </Link>

                {/* Login/Signup Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-border/30"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-6 shadow-lg shadow-primary/25">
                            <span className="text-3xl font-bold jp-text">日</span>
                        </div>

                        <h1 className="text-3xl font-bold text-heading mb-3">
                            {isSignUp ? 'Tạo tài khoản' : 'Chào mừng trở lại'}
                        </h1>
                        <p className="text-text-muted">
                            {isSignUp ? 'Đăng ký để bắt đầu học tiếng Nhật' : 'Đăng nhập để tiếp tục học tiếng Nhật'}
                        </p>
                    </div>

                    {/* Success Message */}
                    {message === 'check_email' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20"
                        >
                            <p className="text-sm text-primary text-center">
                                ✅ Kiểm tra email để xác nhận tài khoản!
                            </p>
                        </motion.div>
                    )}

                    {message === 'password_updated' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200"
                        >
                            <p className="text-sm text-green-600 text-center">
                                ✅ Mật khẩu đã được cập nhật! Hãy đăng nhập với mật khẩu mới.
                            </p>
                        </motion.div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
                        >
                            <p className="text-sm text-destructive text-center">
                                {error === 'oauth_failed'
                                    ? 'Đăng nhập thất bại. Vui lòng thử lại.'
                                    : error === 'missing_credentials'
                                        ? 'Vui lòng điền đầy đủ thông tin.'
                                        : error}
                            </p>
                        </motion.div>
                    )}

                    {/* Redirect info */}
                    {redirectTo && (
                        <div className="mb-6 p-3 rounded-xl bg-primary/10 border border-primary/20">
                            <p className="text-xs text-primary text-center">
                                Đăng nhập để tiếp tục
                            </p>
                        </div>
                    )}

                    {/* Email/Password Form */}
                    <form action={isSignUp ? signUpWithEmail : loginWithEmail} onSubmit={handleEmailSubmit} className="space-y-4 mb-6">
                        {isSignUp && (
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-zinc-700 mb-2">
                                    Họ và tên
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        placeholder="Nguyễn Văn A"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors"
                                />
                            </div>
                            {isSignUp && (
                                <p className="mt-1 text-xs text-zinc-500">
                                    Tối thiểu 6 ký tự
                                </p>
                            )}
                        </div>

                        {/* Remember me checkbox - only show for login */}
                        {!isSignUp && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        name="rememberMe"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <label htmlFor="rememberMe" className="text-sm text-zinc-600 cursor-pointer select-none">
                                        Ghi nhớ đăng nhập
                                    </label>
                                </div>
                                <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
                                    Quên mật khẩu?
                                </Link>
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading || isGoogleLoading}
                            className="w-full btn-primary disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <span>{isSignUp ? 'Đăng ký' : 'Đăng nhập'}</span>
                            )}
                        </motion.button>
                    </form>

                    {/* Toggle Sign Up / Login */}
                    <div className="text-center mb-6">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-primary hover:underline"
                        >
                            {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-3 text-zinc-500">
                                Hoặc
                            </span>
                        </div>
                    </div>

                    {/* Google Login Button */}
                    <form action={loginWithGoogle} onSubmit={handleGoogleSubmit}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading || isGoogleLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-xl px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isGoogleLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Đang kết nối...</span>
                                </>
                            ) : (
                                <>
                                    <Chrome className="h-5 w-5" />
                                    <span>Tiếp tục với Google</span>
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Features */}
                    <div className="mt-8 space-y-3">
                        {[
                            { icon: Sparkles, text: "Học miễn phí với các bài học cơ bản" },
                            { icon: Sparkles, text: "Theo dõi tiến độ học tập của bạn" },
                            { icon: Sparkles, text: "Truy cập từ mọi thiết bị" },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 text-sm text-zinc-600"
                            >
                                <feature.icon className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-zinc-200">
                        <p className="text-xs text-center text-zinc-500">
                            Bằng việc đăng nhập, bạn đồng ý với{" "}
                            <Link href="/terms" className="text-primary hover:underline">
                                Điều khoản sử dụng
                            </Link>{" "}
                            và{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                                Chính sách bảo mật
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
