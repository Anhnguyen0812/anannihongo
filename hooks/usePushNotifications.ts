'use client'

import { useEffect, useState, useCallback } from 'react'

// VAPID Public Key - Bạn cần thay thế bằng key của mình
// Tạo bằng lệnh: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')
    
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
    const [permissionState, setPermissionState] = useState<NotificationPermission>('default')

    // Kiểm tra browser có hỗ trợ không
    useEffect(() => {
        const checkSupport = async () => {
            const supported = 'serviceWorker' in navigator && 
                             'PushManager' in window && 
                             'Notification' in window

            setIsSupported(supported)
            
            if (supported) {
                setPermissionState(Notification.permission)
            }
        }
        
        checkSupport()
    }, [])

    // Đăng ký Service Worker
    useEffect(() => {
        if (!isSupported) return

        const registerSW = async () => {
            try {
                const reg = await navigator.serviceWorker.register('/sw.js')
                setRegistration(reg)
                
                // Kiểm tra subscription hiện tại
                const existingSub = await reg.pushManager.getSubscription()
                if (existingSub) {
                    setSubscription(existingSub)
                    setIsSubscribed(true)
                }
            } catch (error) {
                console.error('Service Worker registration failed:', error)
            }
        }
        
        registerSW()
    }, [isSupported])

    // Subscribe to push notifications
    const subscribe = useCallback(async () => {
        if (!registration || !VAPID_PUBLIC_KEY) {
            console.error('No registration or VAPID key')
            return false
        }

        try {
            // Request notification permission
            const permission = await Notification.requestPermission()
            setPermissionState(permission)
            
            if (permission !== 'granted') {
                console.log('Notification permission denied')
                return false
            }

            // Subscribe to push
            const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey as BufferSource
            })
            
            setSubscription(sub)
            setIsSubscribed(true)

            // Gửi subscription lên server
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: sub.toJSON() })
            })

            if (!response.ok) {
                throw new Error('Failed to save subscription to server')
            }

            return true
        } catch (error) {
            console.error('Error subscribing to push:', error)
            return false
        }
    }, [registration])

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        if (!subscription) return false

        try {
            // Xóa subscription trên server
            await fetch('/api/push/subscribe', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: subscription.endpoint })
            })

            // Unsubscribe locally
            await subscription.unsubscribe()
            
            setSubscription(null)
            setIsSubscribed(false)
            
            return true
        } catch (error) {
            console.error('Error unsubscribing:', error)
            return false
        }
    }, [subscription])

    return {
        isSupported,
        isSubscribed,
        permissionState,
        subscribe,
        unsubscribe
    }
}
