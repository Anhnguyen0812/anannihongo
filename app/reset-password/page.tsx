"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

/**
 * Reset Password Page (Change Password)
 * 
 * Step 2: User arrives here from email link with valid session
 * Collect new password and update user's password
 */
export default function ResetPasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

    // Check if user has a valid session (came from email link)
    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session) {
                setIsValidSession(true)
            } else {
                setIsValidSession(false)
            }
        }
        
        checkSession()
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        // Validate passwords
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            setIsLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            setIsLoading(false)
            return
        }

        try {
            const supabase = createClient()
            
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                console.error('Update password error:', error)
                setError(error.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.')
                setIsLoading(false)
                return
            }

            setIsSuccess(true)
            setIsLoading(false)

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login?message=password_updated')
            }, 3000)
        } catch (err) {
            console.error('Unexpected error:', err)
            setError('Đã xảy ra lỗi. Vui lòng thử lại.')
            setIsLoading(false)
        }
    }

    // Loading state while checking session
    if (isValidSession === null) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    // Invalid session - no access
    if (isValidSession === false) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="relative w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-border/30 text-center"
                    >
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
                            <Lock className="h-8 w-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900 mb-3">
                            Link không hợp lệ
                        </h1>
                        <p className="text-zinc-600 mb-6">
                            Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. 
                            Vui lòng yêu cầu link mới.
                        </p>
                        <Link href="/forgot-password">
                            <button className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors">
                                Yêu cầu link mới
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Back to login link */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Quay lại đăng nhập</span>
                </Link>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-border/30"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
                            <Lock className="h-8 w-8" />
                        </div>

                        <h1 className="text-3xl font-bold text-heading mb-3">
                            Đặt mật khẩu mới
                        </h1>
                        <p className="text-text-muted">
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </p>
                    </div>

                    {isSuccess ? (
                        // Success state
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                                Cập nhật thành công!
                            </h2>
                            <p className="text-zinc-600 mb-6">
                                Mật khẩu của bạn đã được cập nhật. 
                                Đang chuyển hướng đến trang đăng nhập...
                            </p>
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 mx-auto" />
                        </motion.div>
                    ) : (
                        // Form state
                        <>
                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200"
                                >
                                    <p className="text-sm text-red-600 text-center">
                                        {error}
                                    </p>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-12 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Tối thiểu 6 ký tự
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 mb-2">
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-12 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Đang cập nhật...</span>
                                        </>
                                    ) : (
                                        <span>Đặt mật khẩu mới</span>
                                    )}
                                </motion.button>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
