"use client"

import { motion, AnimatePresence } from "framer-motion"
import { LogOut, BookOpen, User, Menu, X, Loader2, Sparkles, Rocket } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { signOut } from "@/app/login/actions"
import type { Profile } from "@/types/supabase"
import NotificationBell from "./NotificationBell"

interface NavbarProps {
    user: {
        id: string
        email?: string
    } | null
    profile: Profile | null
}

export default function Navbar({ user, profile }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = () => {
        setIsLoggingOut(true)
        
        // Xóa tất cả cache trong localStorage
        if (typeof window !== 'undefined') {
            localStorage.clear()
            sessionStorage.clear()
            
            // Xóa cache của React Query nếu có
            try {
                const queryClient = (window as any).__REACT_QUERY_CLIENT__
                if (queryClient) {
                    queryClient.clear()
                }
            } catch (e) {
                // Ignore errors
            }
        }
    }

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100">
            <div className="zen-container">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className="flex h-10 w-10 items-center justify-center"
                        >
                            <img src="/logo.svg" alt="AnAn Nihongo Logo" className="h-full w-full" />
                        </motion.div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                            AnAn Nihongo
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            href="/learn"
                            className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                        >
                            <BookOpen className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            <span>Khóa học</span>
                        </Link>
                        <Link
                            href="/about"
                            className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
                        >
                            <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            <span>Giới thiệu</span>
                        </Link>
                    </div>

                    {/* Right side - Auth State */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {/* Admin Link - Only for admins */}
                                {profile?.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                    >
                                        👑 Admin
                                    </Link>
                                )}

                                {/* Notification Bell */}
                                <div className="hidden sm:block">
                                    <NotificationBell />
                                </div>


                                {/* User Profile Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        {profile?.avatar_url ? (
                                            <img
                                                src={profile.avatar_url}
                                                alt={profile.full_name || 'User'}
                                                className="h-9 w-9 rounded-xl border-2 border-indigo-200 object-cover shadow-sm"
                                            />
                                        ) : (
                                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center shadow-sm">
                                                <User className="h-5 w-5 text-white" />
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-gray-700 hidden lg:block">
                                            {profile?.full_name || user.email?.split('@')[0]}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isProfileMenuOpen && (
                                            <>
                                                {/* Backdrop */}
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                />

                                                {/* Menu */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    transition={{ duration: 0.2, type: "spring", stiffness: 200 }}
                                                    className="absolute right-0 mt-2 w-56 clay-card rounded-2xl z-50 overflow-hidden"
                                                >
                                                    {/* User Info */}
                                                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                                                        <p className="text-sm font-bold text-gray-800">
                                                            {profile?.full_name || 'User'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {user.email}
                                                        </p>
                                                        <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm">
                                                            {profile?.role === 'admin' ? '👑 Admin' : '🎓 Học viên'}
                                                        </span>
                                                    </div>

                                                    {/* Menu Items */}
                                                    <div className="py-2 px-2">
                                                        <Link
                                                            href="/learn"
                                                            onClick={() => setIsProfileMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 rounded-xl transition-colors group"
                                                        >
                                                            <BookOpen className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                                                            <span className="font-medium">Vào học</span>
                                                        </Link>
                                                        <Link
                                                            href="/profile"
                                                            onClick={() => setIsProfileMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-xl transition-colors group"
                                                        >
                                                            <User className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
                                                            <span className="font-medium">Hồ sơ</span>
                                                        </Link>
                                                    </div>

                                                    {/* Logout */}
                                                    <div className="border-t border-gray-100 py-2 px-2">
                                                        <form action={signOut} onSubmit={handleLogout}>
                                                            <button
                                                                type="submit"
                                                                disabled={isLoggingOut}
                                                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors w-full disabled:opacity-70 group"
                                                            >
                                                                {isLoggingOut ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                                                )}
                                                                <span className="font-medium">{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                                                            </button>
                                                        </form>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Auth Buttons for non-authenticated users */}
                                <div className="hidden sm:flex items-center gap-3">
                                    <Link href="/login?signup=true">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            Đăng ký
                                        </motion.button>
                                    </Link>
                                    <Link href="/login">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="clay-button px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Rocket className="h-4 w-4" />
                                                Đăng nhập
                                            </span>
                                        </motion.button>
                                    </Link>
                                </div>
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6 text-gray-700" />
                            ) : (
                                <Menu className="h-6 w-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-gray-100 bg-white"
                        >
                            <div className="flex flex-col gap-2 py-4 px-2">
                                <Link
                                    href="/learn"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                    <BookOpen className="h-5 w-5 text-indigo-500" />
                                    <span>Khóa học</span>
                                </Link>
                                <Link
                                    href="/about"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                                >
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    <span>Giới thiệu</span>
                                </Link>
                                {!user && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 px-2">
                                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                            <button className="w-full clay-button py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center gap-2">
                                                <Rocket className="h-4 w-4" />
                                                Đăng nhập
                                            </button>
                                        </Link>
                                        <Link href="/login?signup=true" onClick={() => setIsMenuOpen(false)}>
                                            <button className="w-full py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                                                Đăng ký tài khoản mới
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    )
}
