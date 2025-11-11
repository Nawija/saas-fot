import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createErrorResponse } from "@/lib/utils/apiHelpers";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ photoId: string }> }
) {
    try {
        const { photoId } = await params;

        // Pobierz identyfikator gościa (IP lub cookie)
        const guestId = req.headers.get("x-forwarded-for") || "unknown";

        // Try insert; if it already exists, treat as conflict and return unlike response
        const insertRes = await query(
            "INSERT INTO photo_likes (photo_id, guest_session_id) VALUES ($1, $2) ON CONFLICT (photo_id, guest_session_id) DO NOTHING RETURNING id",
            [photoId, guestId]
        );

        if (insertRes.rows.length === 0) {
            // already liked -> perform unlike
            const del = await query(
                "DELETE FROM photo_likes WHERE photo_id = $1 AND guest_session_id = $2 RETURNING id",
                [photoId, guestId]
            );

            if (del.rows.length > 0) {
                await query(
                    "UPDATE photos SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1",
                    [photoId]
                );
            }

            return NextResponse.json({ ok: true, liked: false });
        }

        // New like inserted -> increment denormalized counter
        await query(
            "UPDATE photos SET like_count = like_count + 1 WHERE id = $1",
            [photoId]
        );

        return NextResponse.json({ ok: true, liked: true });
    } catch (error: any) {
        console.error("Like photo error:", error);
        return createErrorResponse("Błąd polubienia zdjęcia", 500);
    }
}
