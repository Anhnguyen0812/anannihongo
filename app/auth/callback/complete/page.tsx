"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * OAuth Callback Complete Handler
 * 
 * This client-side page handles the rememberMe preference after Google OAuth.
 * It reads from localStorage and calls an API to set the appropriate cookies.
 */
export default function CallbackCompletePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirectTo') || '/learn'

    useEffect(() => {
        const handleRememberMe = async () => {
            // Get rememberMe preference from localStorage
            const rememberMe = localStorage.getItem('rememberMe')
            
            // Clear the stored preference
            localStorage.removeItem('rememberMe')

            // If user chose NOT to remember, set the session-only cookie
            if (rememberMe === 'false') {
                try {
                    await fetch('/api/auth/session-type', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ sessionOnly: true }),
                    })
                } catch (error) {
                    console.error('Error setting session type:', error)
                }
            }

            // Redirect to the final destination
            router.replace(redirectTo)
        }

        handleRememberMe()
    }, [redirectTo, router])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-zinc-600">Đang hoàn tất đăng nhập...</p>
            </div>
        </div>
    )
}
