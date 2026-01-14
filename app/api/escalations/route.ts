import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export async function GET(request: Request) {
    try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
            .from('email_events')
            .select('*, departments(name), users:assigned_user_id(full_name)')
            .eq('tenant_id', process.env.NEXT_PUBLIC_MOCK_TENANT_ID)
            .order('created_at', { ascending: false });

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Escalations API error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
