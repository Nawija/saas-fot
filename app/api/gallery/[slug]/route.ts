import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createErrorResponse } from "@/lib/utils/apiHelpers";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const result = await query(
            `SELECT 
                id, name, slug, description, hero_image, is_public,
                CASE WHEN password_hash IS NOT NULL THEN true ELSE false END as has_password
            FROM collections 
            WHERE slug = $1`,
            [slug]
        );

        if (result.rows.length === 0) {
            return createErrorResponse("Nie znaleziono galerii", 404);
        }

        return NextResponse.json({
            ok: true,
            collection: result.rows[0],
        });
    } catch (error: any) {
        console.error("Get gallery error:", error);
        return createErrorResponse("Błąd pobierania galerii", 500);
    }
}
