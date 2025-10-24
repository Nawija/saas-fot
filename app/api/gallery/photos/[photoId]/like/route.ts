import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createErrorResponse } from "@/lib/utils/apiHelpers";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ photoId: string }> }
) {
    try {
        const { photoId } = await params;

        // Pobierz identyfikator gościa (IP lub wygeneruj cookie)
        const guestId =
            req.headers.get("x-forwarded-for") || "guest-" + Date.now();

        // Sprawdź czy już polubione
        const existingLike = await query(
            "SELECT id FROM photo_likes WHERE photo_id = $1 AND guest_identifier = $2",
            [photoId, guestId]
        );

        if (existingLike.rows.length > 0) {
            // Unlike - usuń polubienie
            await query(
                "DELETE FROM photo_likes WHERE photo_id = $1 AND guest_identifier = $2",
                [photoId, guestId]
            );

            return NextResponse.json({
                ok: true,
                liked: false,
            });
        } else {
            // Like - dodaj polubienie
            await query(
                "INSERT INTO photo_likes (photo_id, guest_identifier) VALUES ($1, $2)",
                [photoId, guestId]
            );

            return NextResponse.json({
                ok: true,
                liked: true,
            });
        }
    } catch (error: any) {
        console.error("Like photo error:", error);
        return createErrorResponse("Błąd polubienia zdjęcia", 500);
    }
}
