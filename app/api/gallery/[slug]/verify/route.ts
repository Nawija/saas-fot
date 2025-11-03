import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import jwt from "jsonwebtoken";

const bcrypt = require("bcrypt");

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const { password } = await req.json();
        const url = new URL(req.url);
        const subdomain = url.searchParams.get("subdomain");

        console.log(
            `[Verify] Attempting to verify: subdomain=${subdomain}, slug=${slug}`
        );

        if (!password) {
            return createErrorResponse("Brak hasła", 400);
        }

        let result;
        if (subdomain) {
            // Szukaj kolekcji po username (subdomain) i slug
            console.log(
                `[Verify] Searching by username: ${subdomain} and slug: ${slug}`
            );
            result = await query(
                `SELECT c.id, c.password_hash, c.slug 
                FROM collections c
                INNER JOIN users u ON c.user_id = u.id
                WHERE u.username = $1 AND c.slug = $2`,
                [subdomain, slug]
            );
        } else {
            // Szukaj kolekcji po slug (bez username)
            result = await query(
                "SELECT id, password_hash, slug FROM collections WHERE slug = $1",
                [slug]
            );
        }

        if (result.rows.length === 0) {
            console.error(
                `Collection not found: subdomain=${subdomain}, slug=${slug}`
            );
            return createErrorResponse("Nie znaleziono galerii", 404);
        }

        const collection = result.rows[0];

        if (!collection.password_hash) {
            return createErrorResponse("Galeria nie ma hasła", 400);
        }

        const isValid = await bcrypt.compare(
            password,
            collection.password_hash
        );

        if (!isValid) {
            return createErrorResponse("Nieprawidłowe hasło", 401);
        }

        // Wygeneruj token dostępu
        const secret = process.env.JWT_SECRET!;
        const token = jwt.sign({ collectionId: collection.id, slug }, secret, {
            expiresIn: "7d",
        });

        return NextResponse.json({
            ok: true,
            token,
        });
    } catch (error: any) {
        console.error("Verify password error:", error);
        return createErrorResponse("Błąd weryfikacji hasła", 500);
    }
}
