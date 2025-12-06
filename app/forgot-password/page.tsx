"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { resetPassword } from "./actions"

/**
 * Forgot Password Page
 * 
 * Step 1: Collect user's email and send password reset email
 */
export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        setError(null)
        
        const result = await resetPassword(formData)
        
        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        } else {
            setIsSuccess(true)
            setIsLoading(false)
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
                            <Mail className="h-8 w-8" />
                        </div>

                        <h1 className="text-3xl font-bold text-heading mb-3">
                            Quên mật khẩu?
                        </h1>
                        <p className="text-text-muted">
                            Nhập email của bạn để nhận link đặt lại mật khẩu
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
                                Kiểm tra email của bạn
                            </h2>
                            <p className="text-zinc-600 mb-6">
                                Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. 
                                Link sẽ hết hạn sau 1 giờ.
                            </p>
                            <Link href="/login">
                                <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    Quay lại đăng nhập
                                </button>
                            </Link>
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

                            <form action={handleSubmit} className="space-y-4">
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
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-colors"
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Đang gửi...</span>
                                        </>
                                    ) : (
                                        <span>Gửi link đặt lại mật khẩu</span>
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
