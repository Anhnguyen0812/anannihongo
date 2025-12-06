'use client'

import { ToastProvider } from './ToastNotification'
import QueryProvider from '@/providers/QueryProvider'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </QueryProvider>
    )
}
