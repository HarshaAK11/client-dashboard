import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createSupabaseBrowserClient();

        // First, get the external message ID to use as evidence_message_id
        const { data: event, error: fetchError } = await supabase
            .from('email_events')
            .select('external_message_id')
            .eq('id', id)
            .single();

        if (fetchError || !event) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        // Update the event fields as requested
        const { error: updateError } = await supabase
            .from('email_events')
            .update({
                pending_resolution: true,
                resolution_expected: 'reply_sent',
                pending_since: new Date().toISOString(),
                evidence_message_id: event.external_message_id
            })
            .eq('id', id);

        if (updateError) {
            return Response.json({ error: updateError.message }, { status: 400 });
        }

        return Response.json({ message: "Resolution intent set successfully" }, { status: 200 });

    } catch (error) {
        console.error('Pending Resolution API error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
