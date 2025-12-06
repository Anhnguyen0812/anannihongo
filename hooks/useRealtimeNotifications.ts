'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createAdminClient } from '@/utils/supabase/admin-client'

interface NotificationPayload {
    id: number
    title: string
    content: string
    type: string
}

/**
 * Hook to handle real-time browser notifications
 * - Requests notification permission
 * - Subscribes to Supabase Realtime for new notifications
 * - Shows browser popup notifications
 */
export function useRealtimeNotifications(userId: string | undefined) {
    const supabase = createAdminClient()
    const permissionRef = useRef<NotificationPermission>('default')

    // Request notification permission
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.log('Browser does not support notifications')
            return false
        }

        if (Notification.permission === 'granted') {
            permissionRef.current = 'granted'
            return true
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission()
            permissionRef.current = permission
            return permission === 'granted'
        }

        return false
    }, [])

    // Show browser notification
    const showNotification = useCallback((payload: NotificationPayload) => {
        if (permissionRef.current !== 'granted') return

        const notification = new Notification(payload.title, {
            body: payload.content,
            icon: '/logo.svg',
            badge: '/logo.svg',
            tag: `notification-${payload.id}`,
            requireInteraction: false,
        })

        notification.onclick = () => {
            window.focus()
            notification.close()
        }

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000)
    }, [])

    useEffect(() => {
        if (!userId) return

        // Request permission on mount
        requestPermission()

        // Subscribe to new notifications for this user
        const channel = supabase
            .channel('user-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'user_notifications',
                    filter: `user_id=eq.${userId}`,
                },
                async (payload) => {
                    // Fetch the notification details
                    const { data: notification } = await supabase
                        .from('notifications')
                        .select('*')
                        .eq('id', payload.new.notification_id)
                        .single()

                    if (notification) {
                        showNotification(notification as NotificationPayload)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase, requestPermission, showNotification])

    return { requestPermission }
}
