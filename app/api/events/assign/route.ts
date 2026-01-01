import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/middleware/auth";
import { permissions } from "@/lib/permissions";
import { logAccess } from "@/lib/audit";

/**
 * POST /api/events/assign
 * 
 * Assign an event to a user.
 * Only managers and admins can assign events.
 */
export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedUser(request);
        const body = await request.json();
        const { eventId, assignedUserId } = body;

        // Validate input
        if (!eventId || !assignedUserId) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check write permission
        if (!permissions.canAssignEvents(user.role)) {
            return Response.json({ error: 'Forbidden: Insufficient permissions to assign events' }, { status: 403 });
        }

        // For managers, verify the event is in their department
        if (user.role === 'manager') {
            const { data: event } = await supabase
                .from('email_events')
                .select('department_id, tenant_id')
                .eq('id', eventId)
                .single();

            if (!event || event.department_id !== user.department_id || event.tenant_id !== user.tenant_id) {
                return Response.json({ error: 'Forbidden: Event not in your department' }, { status: 403 });
            }
        }

        // Perform the assignment
        const { data, error } = await supabase
            .from('email_events')
            .update({
                assigned_user_id: assignedUserId,
                updated_at: new Date().toISOString()
            })
            .eq('id', eventId)
            .select();

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        // Log the write action
        await logAccess({
            userId: user.id,
            userRole: user.role,
            action: 'write',
            resourceType: 'email_event',
            resourceId: eventId,
            endpoint: '/api/events/assign',
            request,
            metadata: {
                assignedTo: assignedUserId,
                action: 'assign',
            },
        });

        return Response.json({ data, message: 'Event assigned successfully' }, { status: 200 });
    } catch (error) {
        console.error('Assign event error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
