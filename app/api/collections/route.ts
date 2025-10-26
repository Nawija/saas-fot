import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { query } from "@/lib/db";
import { createErrorResponse } from "@/lib/utils/apiHelpers";

export async function GET() {
    try {
        const user = await getUser();

        if (!user) {
            return createErrorResponse("Nie zalogowano", 401);
        }

        const result = await query(
            `SELECT 
                c.*,
                COUNT(p.id) as photo_count
            FROM collections c
            LEFT JOIN photos p ON c.id = p.collection_id
            WHERE c.user_id = $1
            GROUP BY c.id
            ORDER BY c.created_at DESC`,
            [user.id]
        );

        return NextResponse.json({
            ok: true,
            collections: result.rows,
        });
    } catch (error: any) {
        console.error("Get collections error:", error);
        return createErrorResponse("Błąd pobierania kolekcji", 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();

        if (!user) {
            return createErrorResponse("Nie zalogowano", 401);
        }

        const { name, slug, description, hero_image, password, is_public } =
            await req.json();

        if (!name || !slug) {
            return createErrorResponse("Nazwa i slug są wymagane", 400);
        }

        // Sprawdź czy slug jest unikalny dla tego użytkownika
        const existing = await query(
            "SELECT id FROM collections WHERE user_id = $1 AND slug = $2",
            [user.id, slug]
        );

        if (existing.rows.length > 0) {
            return createErrorResponse(
                "Kolekcja z tym adresem URL już istnieje",
                400
            );
        }

        // Hash hasła jeśli jest podane
        let passwordHash = null;
        if (password) {
            const bcrypt = require("bcrypt");
            passwordHash = await bcrypt.hash(password, 10);
        }

        const result = await query(
            `INSERT INTO collections 
            (user_id, name, slug, description, hero_image, password_hash, password_plain, is_public)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                user.id,
                name,
                slug,
                description || null,
                hero_image || null,
                passwordHash,
                password || null,
                is_public || false,
            ]
        );

        return NextResponse.json({
            ok: true,
            collection: result.rows[0],
        });
    } catch (error: any) {
        console.error("Create collection error:", error);
        return createErrorResponse("Błąd tworzenia kolekcji", 500);
    }
}
