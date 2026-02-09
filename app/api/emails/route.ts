import { createSupabaseBrowser } from '@/lib/supabase/client';  
import { getAuthUserOrError } from '@/lib/auth';  

export async function GET(request: Request) {
    try {
        const authResult = await getAuthUserOrError()
        
        if ('error' in authResult) {
            return Response.json({ error: authResult.error }, { status: authResult.status })
        }

        const { user } = authResult

        const supabase = createSupabaseBrowser();
        
        const { data, error } = await supabase
            .from('email_events')
            .select('*')
            .eq('tenant_id', user.tenant_id)
            .order('created_at', { ascending: false });

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Emails API error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
