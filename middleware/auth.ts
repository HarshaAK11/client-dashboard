import { supabase } from '@/lib/supabase';
import { validateRoleSnapshot } from '@/lib/session-validation';

/**
 * Authentication Middleware for API Routes
 * 
 * Verifies user authentication and extracts user details including role.
 * Also validates that the role hasn't changed since session start.
 */

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: 'admin' | 'manager' | 'agent';
    tenant_id: string;
    department_id?: string;
}

/**
 * Get authenticated user from request
 * @throws Error if user is not authenticated or role has changed
 */
export async function getAuthenticatedUser(
    request: Request
): Promise<AuthenticatedUser> {
    try {
        // Get session from Supabase
        const authHeader = request.headers.get('Authorization');

        // For server-side, we need to create a client with the auth header
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            throw new Error('Unauthorized');
        }

        // Fetch user details including role
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, role, tenant_id, department_id')
            .eq('id', session.user.id)
            .single();

        if (userError || !user) {
            throw new Error('User not found');
        }

        // Validate role hasn't changed since session start
        const sessionRole = session.user.user_metadata?.role;
        if (sessionRole && sessionRole !== user.role) {
            // Role changed - invalidate session
            await supabase.auth.signOut();
            throw new Error('ROLE_CHANGED_LOGOUT_REQUIRED');
        }

        return user as AuthenticatedUser;
    } catch (error) {
        throw error;
    }
}

/**
 * Verify user has required role
 */
export function requireRole(
    user: AuthenticatedUser,
    allowedRoles: string[]
): boolean {
    return allowedRoles.includes(user.role);
}

export default {
    getAuthenticatedUser,
    requireRole,
};
