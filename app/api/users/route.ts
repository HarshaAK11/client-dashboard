import { createSupabaseBrowser } from '@/lib/supabase/client';
import { NextResponse, NextRequest } from 'next/server';
import { getAuthUserOrError } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const authResult = await getAuthUserOrError()

        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            )
        }

        const { user } = authResult

        return NextResponse.json(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        )
        /*const supabase = createSupabaseBrowser();
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        return NextResponse.json(
            {
                id: user.id,
                email: user.email,
                name: user.user_metadata.full_name,
                role: user.role,
            }
        )*/
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
