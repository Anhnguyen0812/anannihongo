'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Bell, Smartphone, Check, X, Loader2 } from 'lucide-react'
import {
    setNotificationVolume,
    setNotificationSoundEnabled,
    getNotificationSoundEnabled
} from '@/hooks/useRealtimeNotifications'
import { usePushNotifications } from '@/hooks/usePushNotifications'

// Lấy volume từ localStorage
const getStoredVolume = () => {
    if (typeof window === 'undefined') return 0.5
    return parseFloat(localStorage.getItem('notification_volume') || '0.5')
}

export default function NotificationSettings() {
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [volume, setVolume] = useState(0.5)
    const [mounted, setMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    // Push notifications hook
    const { 
        isSupported: isPushSupported, 
        isSubscribed, 
        permissionState,
        subscribe, 
        unsubscribe 
    } = usePushNotifications()

    // Load settings từ localStorage khi component mount
    useEffect(() => {
        setMounted(true)
        setSoundEnabled(getNotificationSoundEnabled())
        setVolume(getStoredVolume())
    }, [])

    // Handle toggle sound
    const handleToggleSound = () => {
        const newValue = !soundEnabled
        setSoundEnabled(newValue)
        setNotificationSoundEnabled(newValue)
    }

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value)
        setVolume(newVolume)
        setNotificationVolume(newVolume)
    }

    // Test sound
    const handleTestSound = () => {
        const audio = new Audio('/audio/noti.mp3')
        audio.volume = volume
        audio.play().catch(() => {})
    }
    
    // Handle push notification toggle
    const handlePushToggle = async () => {
        setIsLoading(true)
        try {
            if (isSubscribed) {
                await unsubscribe()
            } else {
                await subscribe()
            }
        } catch (error) {
            console.error('Error toggling push:', error)
        }
        setIsLoading(false)
    }

    // Không render gì cho đến khi đã mount để tránh hydration mismatch
    if (!mounted) {
        return (
            <div className="bg-white p-5 rounded-xl border border-zinc-200">
                <div className="animate-pulse">
                    <div className="h-6 w-48 bg-zinc-200 rounded mb-4"></div>
                    <div className="h-10 w-full bg-zinc-100 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-900">Cài đặt thông báo</h2>
            </div>

            {/* Toggle Sound */}
            <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                    {soundEnabled ? (
                        <Volume2 className="h-5 w-5 text-zinc-500" />
                    ) : (
                        <VolumeX className="h-5 w-5 text-zinc-400" />
                    )}
                    <div>
                        <p className="text-sm font-medium text-zinc-900">Âm thanh thông báo</p>
                        <p className="text-xs text-zinc-500">Phát âm thanh khi có thông báo mới</p>
                    </div>
                </div>
                <button
                    onClick={handleToggleSound}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        soundEnabled ? 'bg-indigo-600' : 'bg-zinc-300'
                    }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>

            {/* Volume Slider */}
            <div className={`space-y-3 transition-opacity ${soundEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-700">Âm lượng</p>
                    <span className="text-sm text-zinc-500 font-medium">{Math.round(volume * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                    <VolumeX className="h-4 w-4 text-zinc-400 shrink-0" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <Volume2 className="h-4 w-4 text-zinc-400 shrink-0" />
                </div>
            </div>

            {/* Test Sound Button */}
            <button
                onClick={handleTestSound}
                disabled={!soundEnabled}
                className={`w-full py-2.5 px-4 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                    soundEnabled
                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
            >
                <Volume2 className="h-4 w-4" />
                Thử âm thanh
            </button>

            {/* Push Notifications Section */}
            {isPushSupported && (
                <div className="pt-5 border-t border-zinc-200 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900">Push Notification</h3>
                            <p className="text-xs text-zinc-500">Nhận thông báo ngay cả khi đóng trình duyệt</p>
                        </div>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center justify-between py-3 bg-zinc-50 rounded-lg px-4">
                        <div className="flex items-center gap-2">
                            {isSubscribed ? (
                                <>
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm text-zinc-700">Đã bật push notification</span>
                                </>
                            ) : permissionState === 'denied' ? (
                                <>
                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                    <span className="text-sm text-zinc-700">Bị chặn bởi trình duyệt</span>
                                </>
                            ) : (
                                <>
                                    <div className="h-2 w-2 rounded-full bg-zinc-400"></div>
                                    <span className="text-sm text-zinc-700">Chưa bật</span>
                                </>
                            )}
                        </div>
                        
                        {permissionState !== 'denied' && (
                            <button
                                onClick={handlePushToggle}
                                disabled={isLoading}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                                    isSubscribed
                                        ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : isSubscribed ? (
                                    <>
                                        <X className="h-4 w-4" />
                                        Tắt
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Bật ngay
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    
                    {permissionState === 'denied' && (
                        <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                            ⚠️ Bạn đã chặn thông báo. Vui lòng vào cài đặt trình duyệt để bật lại quyền thông báo cho trang web này.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
