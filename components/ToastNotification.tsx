'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, BookOpen, Megaphone, Info, CheckCircle, AlertCircle } from 'lucide-react'

// Toast types
export type ToastType = 'general' | 'course' | 'announcement' | 'success' | 'error' | 'info'

export interface Toast {
    id: string
    title: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

// Toast Item Component - Clean minimal design
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const getIcon = () => {
        switch (toast.type) {
            case 'course': return <BookOpen className="w-4 h-4" />
            case 'announcement': return <Megaphone className="w-4 h-4" />
            case 'success': return <CheckCircle className="w-4 h-4" />
            case 'error': return <AlertCircle className="w-4 h-4" />
            case 'info': return <Info className="w-4 h-4" />
            default: return <Bell className="w-4 h-4" />
        }
    }

    const getAccentColor = () => {
        switch (toast.type) {
            case 'course': return 'text-indigo-500 bg-indigo-50'
            case 'announcement': return 'text-rose-500 bg-rose-50'
            case 'success': return 'text-emerald-500 bg-emerald-50'
            case 'error': return 'text-red-500 bg-red-50'
            case 'info': return 'text-blue-500 bg-blue-50'
            default: return 'text-indigo-500 bg-indigo-50'
        }
    }

    const getProgressColor = () => {
        switch (toast.type) {
            case 'course': return 'bg-indigo-500'
            case 'announcement': return 'bg-rose-500'
            case 'success': return 'bg-emerald-500'
            case 'error': return 'bg-red-500'
            case 'info': return 'bg-blue-500'
            default: return 'bg-indigo-500'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden max-w-sm w-full"
        >
            <div className="p-4">
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg shrink-0 ${getAccentColor()}`}>
                        {getIcon()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-zinc-900 text-sm">
                            {toast.title}
                        </h4>
                        <p className="text-zinc-500 text-sm mt-0.5 line-clamp-2">
                            {toast.message}
                        </p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onRemove}
                        className="p-1 rounded-md hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600 shrink-0 self-start"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${getProgressColor()} origin-left`}
            />
        </motion.div>
    )
}

// Toast Container
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    return (
        <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem
                            toast={toast}
                            onRemove={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    )
}

// Toast Provider
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const duration = toast.duration || 5000

        setToasts((prev) => [...prev, { ...toast, id }])

        // Auto remove after duration
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}
