import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createSupabaseBrowserClient();
        const { id } = await params;
        const body = await request.json();

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

        return Response.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Update user error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
