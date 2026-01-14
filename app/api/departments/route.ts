import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export async function GET(request: Request) {
    try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
            .from('departments')    
            .select('*')
            .eq('tenant_id', process.env.NEXT_PUBLIC_MOCK_TENANT_ID)
            .order('name', { ascending: true });

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Departments API error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
