import { supabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const supabase = await supabaseServerClient({ admin: true })

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
        })

        if (error) {
            return NextResponse.json(
                { error: "Failed to send reset password email" },
                { status: 500 }
            ) 
        }

        return NextResponse.json(
            { success: true },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}