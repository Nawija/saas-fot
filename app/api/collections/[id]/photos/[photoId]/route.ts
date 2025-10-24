// app/api/collections/[id]/photos/[photoId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUser } from "@/lib/auth/getUser";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; photoId: string }> }
) {
    try {
        const { id, photoId } = await params;
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Pobierz rozmiar zdjęcia przed usunięciem
        const photoResult = await query(
            `SELECT file_size FROM photos 
       WHERE id = $1 AND collection_id = $2 AND user_id = $3`,
            [photoId, id, user.id]
        );

        if (photoResult.rows.length === 0) {
            return NextResponse.json(
                { error: "Photo not found" },
                { status: 404 }
            );
        }

        const fileSize = photoResult.rows[0].file_size;

        // Usuń zdjęcie
        await query("DELETE FROM photos WHERE id = $1 AND user_id = $2", [
            photoId,
            user.id,
        ]);

        // Zaktualizuj storage_used
        await query(
            "UPDATE users SET storage_used = storage_used - $1 WHERE id = $2",
            [fileSize, user.id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete photo error:", error);
        return NextResponse.json(
            { error: "Failed to delete photo" },
            { status: 500 }
        );
    }
}
