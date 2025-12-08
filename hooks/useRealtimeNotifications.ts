'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createAdminClient } from '@/utils/supabase/admin-client'

// Đường dẫn file âm thanh thông báo
const NOTIFICATION_SOUND_URL = '/audio/noti.mp3'
const NOTIFICATION_VOLUME_KEY = 'notification_volume'
const NOTIFICATION_ENABLED_KEY = 'notification_sound_enabled'

// Lấy settings từ localStorage
const getNotificationSettings = () => {
    if (typeof window === 'undefined') return { volume: 0.5, enabled: true }
    const volume = parseFloat(localStorage.getItem(NOTIFICATION_VOLUME_KEY) || '0.5')
    const enabled = localStorage.getItem(NOTIFICATION_ENABLED_KEY) !== 'false'
    return { volume: Math.min(1, Math.max(0, volume)), enabled }
}

// Lưu settings vào localStorage
export const setNotificationVolume = (volume: number) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(NOTIFICATION_VOLUME_KEY, String(Math.min(1, Math.max(0, volume))))
        if (notificationAudio) notificationAudio.volume = volume
    }
}

export const setNotificationSoundEnabled = (enabled: boolean) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(NOTIFICATION_ENABLED_KEY, String(enabled))
    }
}

export const getNotificationSoundEnabled = () => {
    return getNotificationSettings().enabled
}

// Audio element được preload để tránh bị chặn bởi trình duyệt
let notificationAudio: HTMLAudioElement | null = null
let audioUnlocked = false

// Khởi tạo audio element (chỉ chạy trên client)
if (typeof window !== 'undefined') {
    const settings = getNotificationSettings()
    notificationAudio = new Audio(NOTIFICATION_SOUND_URL)
    notificationAudio.volume = settings.volume
    notificationAudio.preload = 'auto'
    
    // Unlock audio khi user có bất kỳ interaction nào
    const unlockAudio = () => {
        if (audioUnlocked) return
        if (notificationAudio) {
            // Phát âm thanh im lặng để unlock
            const originalVolume = notificationAudio.volume
            notificationAudio.volume = 0
            notificationAudio.play().then(() => {
                notificationAudio!.pause()
                notificationAudio!.currentTime = 0
                notificationAudio!.volume = originalVolume
                audioUnlocked = true
            }).catch(() => {})
        }
        // Xóa event listeners sau khi unlock
        document.removeEventListener('click', unlockAudio)
        document.removeEventListener('touchstart', unlockAudio)
        document.removeEventListener('keydown', unlockAudio)
    }
    
    document.addEventListener('click', unlockAudio)
    document.addEventListener('touchstart', unlockAudio)
    document.addEventListener('keydown', unlockAudio)
}

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

    // Phát âm thanh thông báo
    const playNotificationSound = useCallback(() => {
        try {
            const settings = getNotificationSettings()
            if (!settings.enabled) return // Không phát nếu đã tắt
            
            if (notificationAudio) {
                notificationAudio.currentTime = 0
                notificationAudio.volume = settings.volume
                notificationAudio.play().catch(() => {})
            }
        } catch (error) {
            // Silent fail
        }
    }, [])

    // Show browser notification
    const showNotification = useCallback((payload: NotificationPayload) => {
        if (permissionRef.current !== 'granted') return

        // Phát âm thanh thông báo tùy chỉnh
        playNotificationSound()

        const notification = new Notification(payload.title, {
            body: payload.content,
            icon: '/logo.svg',
            badge: '/logo.svg',
            tag: `notification-${payload.id}`,
            requireInteraction: false,
            silent: true, // Tắt âm thanh mặc định của Windows
        })

        notification.onclick = () => {
            window.focus()
            notification.close()
        }

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000)
    }, [playNotificationSound])

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
