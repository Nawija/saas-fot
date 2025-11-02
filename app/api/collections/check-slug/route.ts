import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        if (!slug) {
            return NextResponse.json(
                { error: "Slug is required" },
                { status: 400 }
            );
        }

        // Sprawdź czy slug już istnieje dla tego użytkownika
        const result = await query(
            "SELECT id FROM collections WHERE user_id = $1 AND slug = $2",
            [user.id, slug]
        );

        const available = result.rows.length === 0;

        return NextResponse.json({
            available,
            slug,
        });
    } catch (error) {
        console.error("Error checking slug:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
