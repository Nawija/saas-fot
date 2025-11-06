import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const result = await query(
            "SELECT id, email, subscribed_at, is_active FROM newsletter_subscribers ORDER BY subscribed_at DESC"
        );

        return NextResponse.json({
            subscribers: result.rows,
            total: result.rows.length,
            active: result.rows.filter((s) => s.is_active).length,
        });
    } catch (error) {
        console.error("Get subscribers error:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscribers" },
            { status: 500 }
        );
    }
}
