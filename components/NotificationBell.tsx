'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createAdminClient } from '@/utils/supabase/admin-client'
import type { NotificationWithStatus } from '@/types/supabase'
import { Bell, X, Info, BookOpen, Megaphone } from 'lucide-react'
import { useToast, ToastType } from './ToastNotification'
import { getNotificationSoundEnabled, setNotificationVolume, setNotificationSoundEnabled } from '@/hooks/useRealtimeNotifications'

// Đường dẫn file âm thanh thông báo
const NOTIFICATION_SOUND_URL = '/audio/noti.mp3'

// Audio element được preload
let notificationAudio: HTMLAudioElement | null = null
let audioUnlocked = false

if (typeof window !== 'undefined') {
    notificationAudio = new Audio(NOTIFICATION_SOUND_URL)
    notificationAudio.volume = 0.5
    notificationAudio.preload = 'auto'
    
    // Unlock audio khi user có bất kỳ interaction nào
    const unlockAudio = () => {
        if (audioUnlocked) return
        if (notificationAudio) {
            const originalVolume = notificationAudio.volume
            notificationAudio.volume = 0
            notificationAudio.play().then(() => {
                notificationAudio!.pause()
                notificationAudio!.currentTime = 0
                notificationAudio!.volume = originalVolume
                audioUnlocked = true
            }).catch(() => {})
        }
        document.removeEventListener('click', unlockAudio)
        document.removeEventListener('touchstart', unlockAudio)
        document.removeEventListener('keydown', unlockAudio)
    }
    
    document.addEventListener('click', unlockAudio)
    document.addEventListener('touchstart', unlockAudio)
    document.addEventListener('keydown', unlockAudio)
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationWithStatus[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const permissionRef = useRef<NotificationPermission>('default')

    const supabase = createAdminClient()
    const { addToast } = useToast()

    // Request browser notification permission
    const requestNotificationPermission = useCallback(async () => {
        if (!('Notification' in window)) {
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

    // Phát âm thanh thông báo tùy chỉnh
    const playNotificationSound = useCallback(() => {
        try {
            if (!getNotificationSoundEnabled()) return // Không phát nếu đã tắt
            
            if (notificationAudio) {
                notificationAudio.currentTime = 0
                notificationAudio.play().catch(() => {})
            }
        } catch (error) {
            // Silent fail
        }
    }, [])

    // Show browser notification popup
    const showBrowserNotification = useCallback((title: string, body: string, id: number) => {
        if (permissionRef.current !== 'granted') return
        
        // Phát âm thanh tùy chỉnh
        playNotificationSound()
        
        const notification = new Notification(title, {
            body: body,
            icon: '/logo.svg',
            badge: '/logo.svg',
            tag: `notification-${id}`,
            silent: true, // Tắt âm thanh mặc định của Windows
        })
        notification.onclick = () => {
            window.focus()
            setIsOpen(true)
            notification.close()
        }
        setTimeout(() => notification.close(), 5000)
    }, [playNotificationSound])

    // Show in-app toast notification
    const showToastNotification = useCallback((title: string, content: string, type: string) => {
        const toastType: ToastType = type === 'course' ? 'course'
            : type === 'announcement' ? 'announcement'
                : 'general'
        addToast({
            title,
            message: content,
            type: toastType,
            duration: 6000,
        })
    }, [addToast])

    // Fetch notifications
    async function fetchNotifications() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        setUserId(user.id)

        const { data } = await supabase
            .from('user_notifications')
            .select(`
                *,
                notification:notifications(*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formattedNotifications = data.map((item: any) => ({
                ...item.notification,
                user_notifications: {
                    id: item.id,
                    user_id: item.user_id,
                    notification_id: item.notification_id,
                    is_read: item.is_read,
                    read_at: item.read_at,
                    created_at: item.created_at,
                }
            })) as NotificationWithStatus[]

            setNotifications(formattedNotifications)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setUnreadCount(data.filter((n: any) => !n.is_read).length)
        }

        setLoading(false)
    }

    // Setup event listeners
    useEffect(() => {
        fetchNotifications()
        requestNotificationPermission()

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Setup Supabase Realtime subscription
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'user_notifications',
                    filter: `user_id=eq.${userId}`,
                },
                async (payload) => {
                    const { data: notification } = await supabase
                        .from('notifications')
                        .select('*')
                        .eq('id', payload.new.notification_id)
                        .single()

                    if (notification) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const newNotif = notification as any

                        // Phát âm thanh tùy chỉnh (hoạt động cả khi browser notification bị chặn)
                        if (notificationAudio && getNotificationSoundEnabled()) {
                            notificationAudio.currentTime = 0
                            notificationAudio.play().catch(() => {})
                        }

                        // Show in-app toast notification (luôn hoạt động)
                        const toastType: ToastType = newNotif.type === 'course' ? 'course'
                            : newNotif.type === 'announcement' ? 'announcement' : 'general'
                        addToast({
                            title: newNotif.title,
                            message: newNotif.content,
                            type: toastType,
                            duration: 6000,
                        })

                        // Show browser notification popup (có thể bị chặn trên mobile)
                        try {
                            const canShowNotif = 'Notification' in window && 
                                (permissionRef.current === 'granted' || Notification.permission === 'granted')

                            if (canShowNotif) {
                                const browserNotif = new Notification(newNotif.title, {
                                    body: newNotif.content,
                                    icon: '/logo.svg',
                                    badge: '/logo.svg',
                                    tag: `notification-${newNotif.id}`,
                                    silent: true,
                                    // Thêm vibrate cho mobile
                                    vibrate: [200, 100, 200],
                                } as NotificationOptions)
                                browserNotif.onclick = () => {
                                    window.focus()
                                    setIsOpen(true)
                                    browserNotif.close()
                                }
                                setTimeout(() => browserNotif.close(), 5000)
                            }
                        } catch (e) {
                            // Browser notification không khả dụng, nhưng toast vẫn hiển thị
                        }

                        const newNotification: NotificationWithStatus = {
                            ...newNotif,
                            user_notifications: {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                id: (payload.new as any).id,
                                user_id: userId,
                                notification_id: newNotif.id,
                                is_read: false,
                                read_at: null,
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                created_at: (payload.new as any).created_at,
                            }
                        }

                        setNotifications(prev => [newNotification, ...prev])
                        setUnreadCount(prev => prev + 1)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])

    async function markAsRead(notificationId: number) {
        if (!userId) return

        await supabase
            .from('user_notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('notification_id', notificationId)

        setNotifications(prev =>
            prev.map(n =>
                n.id === notificationId
                    ? { ...n, user_notifications: { ...n.user_notifications!, is_read: true } }
                    : n
            )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    async function markAllAsRead() {
        if (!userId) return

        await supabase
            .from('user_notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('is_read', false)

        setNotifications(prev =>
            prev.map(n => ({
                ...n,
                user_notifications: { ...n.user_notifications!, is_read: true }
            }))
        )
        setUnreadCount(0)
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'course': return <BookOpen className="w-4 h-4" />
            case 'announcement': return <Megaphone className="w-4 h-4" />
            default: return <Info className="w-4 h-4" />
        }
    }

    const getTypeColor = () => {
        // Unified color scheme - all use indigo
        return 'text-indigo-600 bg-indigo-50'
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 1) return 'Vừa xong'
        if (diffMins < 60) return `${diffMins} phút trước`
        if (diffHours < 24) return `${diffHours} giờ trước`
        if (diffDays < 7) return `${diffDays} ngày trước`
        return date.toLocaleDateString('vi-VN')
    }

    if (loading) {
        return (
            <button className="relative p-2 rounded-lg hover:bg-zinc-100 transition-colors">
                <Bell className="w-5 h-5 text-zinc-400" />
            </button>
        )
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-zinc-100 transition-colors"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-zinc-900' : 'text-zinc-400'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-indigo-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                        <h3 className="font-semibold text-zinc-900 text-sm">Thông báo</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Đọc tất cả
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-zinc-200 rounded-md transition-colors"
                            >
                                <X className="w-4 h-4 text-zinc-400" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell className="w-10 h-10 mx-auto mb-2 text-zinc-200" />
                                <p className="text-zinc-400 text-sm">Chưa có thông báo</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer ${!notification.user_notifications?.is_read ? 'bg-indigo-50/30' : ''
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-1.5 rounded-md ${getTypeColor()} shrink-0`}>
                                            {getTypeIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-zinc-900 text-sm truncate">
                                                    {notification.title}
                                                </h4>
                                                {!notification.user_notifications?.is_read && (
                                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                                                )}
                                            </div>
                                            <p className="text-zinc-500 text-xs line-clamp-1 mt-0.5">
                                                {notification.content}
                                            </p>
                                            <p className="text-zinc-400 text-xs mt-1">
                                                {formatTime(notification.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
