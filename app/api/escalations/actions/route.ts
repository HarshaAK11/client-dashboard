import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export async function POST(request: Request) {
    try {
        const supabase = createSupabaseBrowserClient();
        const { action, eventId, payload } = await request.json();

        if (!eventId) {
            return Response.json({ error: "Event ID is required" }, { status: 400 });
        }

        if (action === 'assign') {
            const { userId } = payload;
            if (!userId) {
                return Response.json({ error: "User ID is required for assignment" }, { status: 400 });
            }

            // Update the event
            const { error } = await supabase
                .from('email_events')
                .update({
                    assigned_user_id: userId,
                })
                .eq('id', eventId);

            if (error) {
                return Response.json({ error: error.message }, { status: 400 });
            }

            return Response.json({ message: "User assigned successfully" }, { status: 200 });
        }

        // Placeholder for other actions
        if (action === 'escalate_department') {
            const { departmentId } = payload;
            const { error } = await supabase
                .from('email_events')
                .update({ department_id: departmentId })
                .eq('id', eventId);

            if (error) return Response.json({ error: error.message }, { status: 400 });
            return Response.json({ message: "Department updated successfully" }, { status: 200 });
        }

        if (action === 'false_escalation') {
            const { error } = await supabase
                .from('email_events')
                .update({ current_state: 'handled' })
                .eq('id', eventId);

            if (error) return Response.json({ error: error.message }, { status: 400 });
            return Response.json({ message: "Marked as false escalation" }, { status: 200 });
        }

        return Response.json({ error: `Action ${action} not implemented` }, { status: 400 });

    } catch (error) {
        console.error('Escalations Actions API error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
