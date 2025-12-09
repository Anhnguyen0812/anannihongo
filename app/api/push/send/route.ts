import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Supabase client để bypass types
const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Type for push subscription from database
interface PushSubscriptionRecord {
    id: string
    user_id: string
    endpoint: string
    p256dh: string
    auth: string
    updated_at: string
}

// Cấu hình VAPID
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@anannihongo.com'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

interface PushPayload {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    url?: string
}

// Gửi push notification đến user cụ thể
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Kiểm tra user là admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single() as { data: { role: string } | null }
            
        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin only' }, { status: 403 })
        }
        
        const { userId, payload }: { userId?: string, payload: PushPayload } = await request.json()
        
        if (!payload || !payload.title) {
            return NextResponse.json({ error: 'Missing payload' }, { status: 400 })
        }

        // Lấy subscriptions - sử dụng admin client
        let query = supabaseAdmin.from('push_subscriptions').select('*')
        
        if (userId) {
            query = query.eq('user_id', userId)
        }
        
        const { data: subscriptions, error } = await query as { 
            data: PushSubscriptionRecord[] | null, 
            error: any 
        }
        
        if (error) {
            console.error('Error fetching subscriptions:', error)
            return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
        }
        
        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ 
                success: true, 
                message: 'No subscriptions found',
                sent: 0 
            })
        }

        // Gửi push đến tất cả subscriptions
        const pushPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/logo.svg',
            badge: payload.badge || '/logo.svg',
            tag: payload.tag || 'notification',
            url: payload.url || '/learn'
        })

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                }
                
                try {
                    await webpush.sendNotification(pushSubscription, pushPayload)
                    return { success: true, endpoint: sub.endpoint }
                } catch (error: any) {
                    // Nếu subscription hết hạn, xóa khỏi database
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        await supabaseAdmin
                            .from('push_subscriptions')
                            .delete()
                            .eq('endpoint', sub.endpoint)
                    }
                    return { success: false, endpoint: sub.endpoint, error: error.message }
                }
            })
        )

        const sent = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length
        const failed = results.length - sent

        return NextResponse.json({ 
            success: true,
            sent,
            failed,
            total: subscriptions.length
        })
    } catch (error) {
        console.error('Error sending push notification:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
