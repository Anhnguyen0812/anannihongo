"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Bell, LogOut, BookOpen, User, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { signOut } from "@/app/login/actions"
import type { Profile } from "@/types/supabase"

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

    return (
        <nav className="zen-navbar">
            <div className="zen-container">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                        >
                            <span className="text-xl font-bold jp-text">日</span>
                        </motion.div>
                        <span className="text-xl font-bold text-foreground hidden sm:block group-hover:text-primary transition-colors">
                            AnAn Nihongo
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/learn"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Khóa học
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Giới thiệu
                        </Link>
                    </div>

                    {/* Right side - Auth State */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {/* Notification Bell */}
                                <button className="relative interactive-scale hidden sm:block">
                                    <Bell className="h-5 w-5 text-foreground" />
                                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                                        3
                                    </span>
                                </button>

                                {/* User Profile Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center gap-2 interactive-scale"
                                    >
                                        {profile?.avatar_url ? (
                                            <img
                                                src={profile.avatar_url}
                                                alt={profile.full_name || 'User'}
                                                className="h-9 w-9 rounded-full border-2 border-primary/20 object-cover"
                                            />
                                        ) : (
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-foreground hidden lg:block">
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
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-xl z-50 overflow-hidden"
                                                >
                                                    {/* User Info */}
                                                    <div className="p-4 border-b border-border/50">
                                                        <p className="text-sm font-medium text-foreground">
                                                            {profile?.full_name || 'User'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {user.email}
                                                        </p>
                                                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary">
                                                            {profile?.role === 'admin' ? 'Admin' : 'Học viên'}
                                                        </span>
                                                    </div>

                                                    {/* Menu Items */}
                                                    <div className="py-2">
                                                        <Link
                                                            href="/learn"
                                                            onClick={() => setIsProfileMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-primary/5 transition-colors"
                                                        >
                                                            <BookOpen className="h-4 w-4" />
                                                            <span>Vào học</span>
                                                        </Link>
                                                        <Link
                                                            href="/profile"
                                                            onClick={() => setIsProfileMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-primary/5 transition-colors"
                                                        >
                                                            <User className="h-4 w-4" />
                                                            <span>Hồ sơ</span>
                                                        </Link>
                                                    </div>

                                                    {/* Logout */}
                                                    <div className="border-t border-border/50 py-2">
                                                        <form action={signOut}>
                                                            <button
                                                                type="submit"
                                                                className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors w-full"
                                                            >
                                                                <LogOut className="h-4 w-4" />
                                                                <span>Đăng xuất</span>
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
                                {/* Login Button for non-authenticated users */}
                                <Link href="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn-primary hidden sm:block"
                                    >
                                        Đăng nhập
                                    </motion.button>
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden interactive-scale"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6 text-foreground" />
                            ) : (
                                <Menu className="h-6 w-6 text-foreground" />
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
                            className="md:hidden border-t border-border/50 mt-2 pt-4 pb-4"
                        >
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/learn"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                                >
                                    Khóa học
                                </Link>
                                <Link
                                    href="/about"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                                >
                                    Giới thiệu
                                </Link>
                                {!user && (
                                    <Link href="/login" className="mt-2">
                                        <button className="btn-primary w-full">
                                            Đăng nhập
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    )
}
