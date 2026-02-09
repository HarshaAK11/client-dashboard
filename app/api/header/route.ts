import { createSupabaseBrowser } from "@/lib/supabase/client";
import { getAuthUserOrError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const authResult = await getAuthUserOrError()

        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status })
        }

        const { user } = authResult

        const supabase = createSupabaseBrowser()

        const { data: tenant } = await supabase
            .from('tenants')
            .select('name')
            .eq('id', user.tenant_id)
            .single()

        return NextResponse.json({
            email: user.email,
            name: user.name,
            role: user.role,
            tenantName: tenant?.name
        })
    } catch (error) {
        console.error('Header API error:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}