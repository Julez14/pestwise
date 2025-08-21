import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
    request: Request,
    { params }: { params: { token: string } },
) {
    try {
        const supabase = await createClient();
        const { token } = params;

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const { data: rows, error: fetchError } = await supabase
            .from("report_share_tokens")
            .select("created_by")
            .eq("token", token)
            .single();

        if (fetchError || !rows) {
            return NextResponse.json({ error: "Token not found" }, {
                status: 404,
            });
        }

        const { error } = await supabase
            .from("report_share_tokens")
            .update({ revoked: true })
            .eq("token", token);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Failed to revoke share link" },
            { status: 500 },
        );
    }
}
