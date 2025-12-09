import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Tạo Supabase admin client để bypass RLS và types
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Lưu push subscription vào database
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Kiểm tra user đã đăng nhập
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const { subscription } = await request.json()
        
        if (!subscription) {
            return NextResponse.json({ error: 'Missing subscription' }, { status: 400 })
        }
        
        // Lưu subscription vào database - sử dụng raw query để bypass types
        const { error } = await supabaseAdmin
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                updated_at: new Date().toISOString()
            } as any, {
                onConflict: 'user_id,endpoint'
            })
        
        if (error) {
            console.error('Error saving subscription:', error)
            return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
        }
        
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in push subscription:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Xóa push subscription khi user unsubscribe
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const { endpoint } = await request.json()
        
        if (!endpoint) {
            return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
        }
        
        const { error } = await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', endpoint)
        
        if (error) {
            console.error('Error deleting subscription:', error)
            return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
        }
        
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in push unsubscription:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
