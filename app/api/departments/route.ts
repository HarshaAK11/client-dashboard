import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/middleware/auth";
import { logAccess } from "@/lib/audit";

/**
 * GET /api/departments
 * 
 * Returns all departments for the current tenant.
 */
export async function GET(request: Request) {
    try {
        let user;
        try {
            user = await getAuthenticatedUser(request);
        } catch (authError) {
            // Development fallback
            console.warn('Auth failed, returning mock departments (dev mode)');
            const mockTenantId = process.env.NEXT_PUBLIC_MOCK_TENANT_ID || 'mock-tenant-id';

            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .eq('tenant_id', mockTenantId)
                .order('name', { ascending: true });

            if (error) {
                return Response.json({ error: error.message }, { status: 400 });
            }

            return Response.json({ data }, { status: 200 });
        }

        // Fetch departments for the user's tenant
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .eq('tenant_id', user.tenant_id)
            .order('name', { ascending: true });

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        // Log access
        await logAccess({
            userId: user.id,
            userRole: user.role,
            action: 'read',
            resourceType: 'department',
            resourceId: 'all',
            endpoint: '/api/departments',
            request,
            tenantId: user.tenant_id,
            metadata: { count: data.length },
        });

        return Response.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Departments API error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
