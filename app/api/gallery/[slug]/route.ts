import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createErrorResponse } from "@/lib/utils/apiHelpers";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const url = new URL(req.url);
        const subdomain = url.searchParams.get("subdomain");

        let result;

        // Jeśli jest subdomena (username), szukaj galerii tego użytkownika
        if (subdomain) {
            result = await query(
                `SELECT 
                    c.id, c.name, c.slug, c.description, c.hero_image, c.hero_image_mobile, c.hero_template, c.hero_font, c.is_public,
                    CASE WHEN c.password_hash IS NOT NULL THEN true ELSE false END as has_password
                FROM collections c
                INNER JOIN users u ON c.user_id = u.id
                WHERE u.username = $1 AND c.slug = $2`,
                [subdomain, slug]
            );
        } else {
            // Standardowe wyszukiwanie po slug (bez username)
            result = await query(
                `SELECT 
                    id, name, slug, description, hero_image, hero_image_mobile, hero_template, hero_font, is_public,
                    CASE WHEN password_hash IS NOT NULL THEN true ELSE false END as has_password
                FROM collections 
                WHERE slug = $1`,
                [slug]
            );
        }

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
