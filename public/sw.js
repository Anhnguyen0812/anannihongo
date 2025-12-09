// Service Worker for Push Notifications
const CACHE_NAME = 'anan-nihongo-v1'

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installed')
    self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated')
    event.waitUntil(clients.claim())
})

// Push notification event
self.addEventListener('push', (event) => {
    console.log('Push notification received', event)
    
    let data = {
        title: 'Thông báo mới',
        body: 'Bạn có thông báo mới từ Anan Nihongo',
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: 'notification',
        url: '/learn'
    }
    
    try {
        if (event.data) {
            data = { ...data, ...event.data.json() }
        }
    } catch (e) {
        console.log('Error parsing push data:', e)
    }
    
    const options = {
        body: data.body,
        icon: data.icon || '/logo.svg',
        badge: data.badge || '/logo.svg',
        tag: data.tag || 'notification',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
            { action: 'open', title: 'Xem ngay' },
            { action: 'close', title: 'Đóng' }
        ],
        data: {
            url: data.url || '/'
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked', event)
    event.notification.close()
    
    const urlToOpen = event.notification.data?.url || '/'
    
    if (event.action === 'close') {
        return
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.navigate(urlToOpen)
                        return client.focus()
                    }
                }
                // If no window is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen)
                }
            })
    )
})

// Background sync (for offline support)
self.addEventListener('sync', (event) => {
    console.log('Background sync', event.tag)
})
