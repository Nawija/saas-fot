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

        // Jeśli jest subdomena, szukaj po subdomenie
        if (subdomain) {
            result = await query(
                `SELECT 
                    id, name, slug, description, hero_image, hero_image_mobile, hero_template, hero_font, is_public, subdomain,
                    CASE WHEN password_hash IS NOT NULL THEN true ELSE false END as has_password
                FROM collections 
                WHERE subdomain = $1`,
                [subdomain]
            );
        } else {
            // Standardowe wyszukiwanie po slug
            result = await query(
                `SELECT 
                    id, name, slug, description, hero_image, hero_image_mobile, hero_template, hero_font, is_public, subdomain,
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
