import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { Role } from '@/types/user';

/**
 * Role Change Session Management
 * 
 * Validates that a user's role hasn't changed mid-session.
 * If role changes, the session is invalidated to prevent permission drift.
 */

/**
 * Validate that the user's role hasn't changed since session start
 * @throws Error if role has changed
 */
export async function validateRoleSnapshot(
    sessionUserId: string,
    sessionRole: string
): Promise<void> {
    try {
        const admin = getSupabaseAdmin();
        const { data: currentUser, error } = await (admin || createSupabaseBrowserClient())
            .from('users')
            .select('role')
            .eq('id', sessionUserId)
            .single();

        if (error) {
            console.error('Error fetching user role:', error);
            throw new Error('Failed to validate role');
        }

        if (currentUser.role !== sessionRole) {
            throw new Error('ROLE_CHANGED_LOGOUT_REQUIRED');
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Check if role has changed without throwing
 * Returns true if role has changed
 */
export async function hasRoleChanged(
    sessionUserId: string,
    sessionRole: string
): Promise<boolean> {
    try {
        const admin = getSupabaseAdmin();
        const { data: currentUser } = await (admin || createSupabaseBrowserClient())
            .from('users')
            .select('role')
            .eq('id', sessionUserId)
            .single();

        return currentUser?.role !== sessionRole;
    } catch (error) {
        console.error('Error checking role change:', error);
        return false;
    }
}

export default {
    validateRoleSnapshot,
    hasRoleChanged,
};
