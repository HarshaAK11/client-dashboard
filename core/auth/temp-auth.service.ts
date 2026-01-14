/**
 * TEMPORARY AUTH WORKAROUND - Development Mode Auth Utilities
 * 
 * This file centralizes all mock data and logic for development mode.
 * It ensures that mock environment variables are referenced in one place only.
 * 
 * @deprecated This is part of the temporary auth workaround and should be removed
 * when transitioning to full Supabase Auth.
 */

export interface DevMockUser {
    id: string;
    email: string;
    role: 'admin' | 'manager' | 'agent';
    tenant_id: string;
    tenant_name: string;
    department_id?: string;
    full_name: string;
}

export const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

/**
 * Returns the mock user if dev mode is enabled.
 * Returns null otherwise.
 */
export function getDevMockUser(): DevMockUser | null {
    if (!isDevMode) return null;

    return {
        id: process.env.NEXT_PUBLIC_MOCK_USER_ID || 'dev-user-id',
        email: 'dev@example.com',
        role: 'admin',
        tenant_id: process.env.NEXT_PUBLIC_MOCK_TENANT_ID || 'dev-tenant-id',
        tenant_name: 'Dev Tenant (Mock)',
        department_id: 'dev-dept-id',
        full_name: 'Development User',
    };
}
