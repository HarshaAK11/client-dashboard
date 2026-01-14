import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export async function GET(request: Request) {
    try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
            .from('users')
            .select('*, departments(name)')
            .eq('tenant_id', process.env.NEXT_PUBLIC_MOCK_TENANT_ID)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        // Transform to include department_name
        const transformedData = data?.map(user => ({
            ...user,
            department_name: user.departments?.name || 'No Department'
        }));

        return Response.json({ data: transformedData });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
