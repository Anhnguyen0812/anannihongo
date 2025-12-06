'use client'

import { ToastProvider } from './ToastNotification'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            {children}
        </ToastProvider>
    )
}
