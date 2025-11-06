import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(
                new URL("/newsletter?error=invalid-token", request.url)
            );
        }

        // Znajdź subskrybenta po tokenie i dezaktywuj
        const result = await query(
            "UPDATE newsletter_subscribers SET is_active = false WHERE unsubscribe_token = $1 RETURNING email",
            [token]
        );

        if (result.rows.length === 0) {
            return NextResponse.redirect(
                new URL("/newsletter?error=not-found", request.url)
            );
        }

        return NextResponse.redirect(
            new URL("/newsletter?unsubscribed=true", request.url)
        );
    } catch (error) {
        console.error("Unsubscribe error:", error);
        return NextResponse.redirect(
            new URL("/newsletter?error=server-error", request.url)
        );
    }
}
