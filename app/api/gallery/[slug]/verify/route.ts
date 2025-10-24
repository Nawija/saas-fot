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

        if (!password) {
            return createErrorResponse("Brak hasła", 400);
        }

        const result = await query(
            "SELECT id, password_hash FROM collections WHERE slug = $1",
            [slug]
        );

        if (result.rows.length === 0) {
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
