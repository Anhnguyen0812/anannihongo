'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell } from 'lucide-react'

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

// Toast Item Component - Minimal design with unified colors
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-white rounded-lg shadow-md border border-zinc-200 overflow-hidden max-w-xs w-full"
        >
            <div className="p-3">
                <div className="flex items-center gap-3">
                    {/* Icon - Simple, unified */}
                    <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 shrink-0">
                        <Bell className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-zinc-900 text-sm truncate">
                            {toast.title}
                        </h4>
                        <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">
                            {toast.message}
                        </p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onRemove}
                        className="p-1 rounded hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600 shrink-0"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Progress bar - unified indigo */}
            <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 origin-left"
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
