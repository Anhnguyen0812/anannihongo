-- =====================================================
-- Notification System Tables for AnAn Nihongo
-- Run this script in Supabase SQL Editor
-- =====================================================

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'course', 'announcement')),
    target_type TEXT DEFAULT 'all' CHECK (target_type IN ('all', 'selected')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user_notifications table (tracking read status per user)
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_id BIGINT NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, notification_id)
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_notification_id ON public.user_notifications(notification_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(user_id, is_read);

-- 4. Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for notifications table
-- Admin can do everything
CREATE POLICY "Admin can manage notifications" ON public.notifications
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- All authenticated users can read notifications
CREATE POLICY "Users can read notifications" ON public.notifications
    FOR SELECT
    TO authenticated
    USING (true);

-- 6. RLS Policies for user_notifications table
-- Users can only see their own notification status
CREATE POLICY "Users can see own notifications" ON public.user_notifications
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can update their own notification status (mark as read)
CREATE POLICY "Users can update own notifications" ON public.user_notifications
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admin and system can insert user notifications
CREATE POLICY "Admin can insert user notifications" ON public.user_notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 7. Ensure profiles table has role column with proper default
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student'));
    END IF;
END $$;

-- 8. Create function to send notification to all users
CREATE OR REPLACE FUNCTION send_notification_to_all(notification_id_param BIGINT)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_notifications (user_id, notification_id)
    SELECT id, notification_id_param
    FROM auth.users
    ON CONFLICT (user_id, notification_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to send notification to selected users
CREATE OR REPLACE FUNCTION send_notification_to_users(notification_id_param BIGINT, user_ids UUID[])
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_notifications (user_id, notification_id)
    SELECT unnest(user_ids), notification_id_param
    ON CONFLICT (user_id, notification_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
