import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const supabase = await createClient();
        const { id } = await params;
        const reportId = parseInt(id, 10);
        const body = await request.json();
        const { noExpiry = false, days = 7 } = body || {};

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const expiresAt = noExpiry
            ? null
            : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

        const token = crypto.randomUUID();

        const { error } = await supabase.from("report_share_tokens").insert({
            report_id: reportId,
            token,
            expires_at: expiresAt,
            created_by: user.id,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;
        const shareUrl = `${origin}/reports/share/${token}`;

        return NextResponse.json({ token, shareUrl, expires_at: expiresAt });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Failed to create share link" },
            { status: 500 },
        );
    }
}
