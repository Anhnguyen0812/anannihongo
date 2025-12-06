'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Interface for user profile update data
 */
interface UpdateUserProfileData {
    full_name?: string | null
    email?: string | null
    avatar_url?: string | null
    role?: string
}

/**
 * Server action to update user profile (all fields)
 */
export async function updateUserProfile(userId: string, data: UpdateUserProfileData) {
    const supabase = await createClient()

    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Bạn chưa đăng nhập' }
    }

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((currentProfile as any)?.role !== 'admin') {
        return { error: 'Bạn không có quyền thực hiện thao tác này' }
    }

    // Prevent admin from removing their own admin role
    if (userId === user.id && data.role && data.role !== 'admin') {
        return { error: 'Bạn không thể tự hạ quyền admin của mình' }
    }

    // Build update data - only include fields that are provided
    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString()
    }
    
    if (data.full_name !== undefined) updateData.full_name = data.full_name
    if (data.email !== undefined) updateData.email = data.email
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url
    if (data.role !== undefined) updateData.role = data.role

    console.log('Updating user profile:', userId, updateData)

    const { error } = await supabase
        .from('profiles')
        .update(updateData as never)
        .eq('id', userId)

    if (error) {
        console.error('Error updating user profile:', error)
        return { error: 'Có lỗi xảy ra khi cập nhật thông tin người dùng' }
    }

    revalidatePath('/admin/users')
    return { success: true }
}

/**
 * Server action to update user role
 */
export async function updateUserRole(userId: string, newRole: string) {
    const supabase = await createClient()

    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Bạn chưa đăng nhập' }
    }

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((currentProfile as any)?.role !== 'admin') {
        return { error: 'Bạn không có quyền thực hiện thao tác này' }
    }

    // Prevent admin from removing their own admin role
    if (userId === user.id && newRole !== 'admin') {
        return { error: 'Bạn không thể tự hạ quyền admin của mình' }
    }

    // Update user role
    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() } as never)
        .eq('id', userId)

    if (error) {
        console.error('Error updating user role:', error)
        return { error: 'Có lỗi xảy ra khi cập nhật quyền người dùng' }
    }

    revalidatePath('/admin/users')
    return { success: true }
}

/**
 * Server action to delete user profile
 * Note: This only deletes the profile, not the auth user
 * To fully delete user, you'd need admin SDK or Supabase Dashboard
 */
export async function deleteUser(userId: string) {
    const supabase = await createClient()

    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Bạn chưa đăng nhập' }
    }

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((currentProfile as any)?.role !== 'admin') {
        return { error: 'Bạn không có quyền thực hiện thao tác này' }
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
        return { error: 'Bạn không thể xóa tài khoản của chính mình' }
    }

    // Check if target user is also admin
    const { data: targetProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((targetProfile as any)?.role === 'admin') {
        return { error: 'Không thể xóa tài khoản admin khác' }
    }

    // Delete user's progress first (if exists)
    await supabase
        .from('progress')
        .delete()
        .eq('user_id', userId)

    // Delete user's notifications (if exists)
    await supabase
        .from('user_notifications')
        .delete()
        .eq('user_id', userId)

    // Delete user profile
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

    if (error) {
        console.error('Error deleting user profile:', error)
        return { error: 'Có lỗi xảy ra khi xóa tài khoản người dùng' }
    }

    revalidatePath('/admin/users')
    return { success: true }
}
