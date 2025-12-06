'use client'

import { useEffect } from 'react'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

/**
 * Provider component that enables real-time notifications
 * Add this to your layout to enable browser notifications globally
 */
export default function NotificationProvider({
    userId,
    children
}: {
    userId: string | undefined
    children: React.ReactNode
}) {
    useRealtimeNotifications(userId)

    return <>{children}</>
}
