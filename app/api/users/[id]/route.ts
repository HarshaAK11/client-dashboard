import { createRequestClient } from "@/lib/supabase/server-client";
import { getAuthenticatedUserFromRequest, AuthError } from "@/middleware/auth";
import { logAccess } from "@/lib/audit";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthenticatedUserFromRequest(request);
        const supabase = createRequestClient(user.accessToken);
        const { id } = params;
        const body = await request.json();

        // Only admins can update users
        if (user.role !== 'admin') {
            return Response.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Validate fields
        const allowedFields = ['role', 'department_id'];
        const updates: any = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return Response.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        await logAccess({
            userId: user.id,
            userRole: user.role,
            action: 'write',
            resourceType: 'user',
            resourceId: id,
            endpoint: `/api/users/${id}`,
            request,
            tenantId: user.tenant_id,
            metadata: { updates },
        });

        return Response.json({ data }, { status: 200 });
    } catch (error) {
        if (error instanceof AuthError) {
            return Response.json({ error: error.message }, { status: error.status });
        }
        console.error('Update user error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
