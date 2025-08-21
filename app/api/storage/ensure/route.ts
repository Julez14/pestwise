import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/user-management";

export async function POST() {
    try {
        const admin = createAdminClient();

        const { data: buckets, error } = await admin.storage.listBuckets();
        if (error) throw error;

        const names = new Set((buckets || []).map((b) => b.name));

        if (!names.has("branding")) {
            await admin.storage.createBucket("branding", { public: true });
        }
        if (!names.has("signatures")) {
            await admin.storage.createBucket("signatures", { public: true });
        }

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({
            error: e?.message || "Failed to ensure buckets",
        }, { status: 500 });
    }
}
