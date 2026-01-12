import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { isDevMode, getDevMockUser } from '@/lib/dev-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Authentication Middleware for API Routes
 * 
 * This implementation uses the Anon Key and validates the session via cookies.
 * It uses the Admin client ONLY after authentication succeeds to fetch the user profile.
 */

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: 'admin' | 'manager' | 'agent';
    tenant_id: string;
    department_id?: string;
    accessToken: string;
}

/**
 * Custom error for authentication and authorization failures
 */
export class AuthError extends Error {
    constructor(public message: string, public status: number = 401) {
        super(message);
        this.name = 'AuthError';
    }
}

/**
 * Get authenticated user from request cookies
 * 
 * 1. Extracts Supabase auth token from cookies
 * 2. Validates token with Supabase Auth (Anon Key)
 * 3. Resolves auth user to public.users profile using Admin client (post-auth)
 * 4. Returns a fresh user object per request
 */
export async function getAuthenticatedUserFromRequest(
    request: Request
): Promise<AuthenticatedUser> {
    // 1. Extract token from cookies
    const cookieHeader = request.headers.get('cookie') || '';

    // Supabase auth cookie pattern: sb-<project-id>-auth-token
    const projectId = supabaseUrl.split('.')[0].replace('https://', '');
    const cookieName = `sb-${projectId}-auth-token`;

    const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const [key, ...v] = c.trim().split('=');
            return [key, v.join('=')];
        })
    );

    let token = cookies[cookieName];

    // Fallback: Check Authorization header if cookie is missing
    if (!token) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        if (isDevMode) {
            console.warn('🚧 API Auth: No token found. Using DEV MOCK user.');
            return { ...getDevMockUser(), accessToken: 'dev-token' } as AuthenticatedUser;
        }
        throw new AuthError('Authentication required', 401);
    }

    // 2. Initialize Supabase Client with Anon Key and Token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });

    try {
        // 3. Verify token with Supabase Auth (Anon Client)
        // This ensures the token is valid and not expired.
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
            console.error('❌ API Auth: Token verification failed:', authError?.message);
            throw new AuthError('Invalid or expired session', 401);
        }

        // 4. Resolve to public.users profile using Admin client
        // We use the admin client here to ensure we can always retrieve the user's role 
        // and tenant context, even if RLS is being restrictive during the initial check.
        const admin = getSupabaseAdmin();
        if (!admin) {
            console.error('❌ API Auth: Supabase Admin client not available');
            throw new AuthError('Server configuration error', 500);
        }

        const { data: user, error: userError } = await admin
            .from('users')
            .select('id, email, role, tenant_id, department_id')
            .eq('id', authUser.id)
            .single();

        if (userError || !user) {
            console.error('❌ API Auth: User profile not found in database:', authUser.email);
            throw new AuthError('User profile not found in database', 403);
        }

        console.log(`✅ API Auth: Authenticated ${user.email} (Tenant: ${user.tenant_id})`);

        return {
            id: user.id,
            email: user.email,
            role: user.role as 'admin' | 'manager' | 'agent',
            tenant_id: user.tenant_id,
            department_id: user.department_id,
            accessToken: token
        };

    } catch (error) {
        if (error instanceof AuthError) throw error;
        console.error('getAuthenticatedUserFromRequest unexpected error:', error);
        throw new AuthError('Internal Server Error', 500);
    }
}

/**
 * Legacy wrapper for getAuthenticatedUserFromRequest
 */
export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser> {
    return getAuthenticatedUserFromRequest(request);
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
    getAuthenticatedUserFromRequest,
    getAuthenticatedUser,
    requireRole,
    AuthError
};

