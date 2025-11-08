// app/api/collections/[id]/photos/[photoId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUser } from "@/lib/auth/getUser";
import { deleteFromR2, extractKeyFromUrl } from "@/lib/r2";

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

        // Pobierz zdjęcie przed usunięciem
        const photoResult = await query(
            `SELECT file_size, file_path FROM photos 
       WHERE id = $1 AND collection_id = $2 AND user_id = $3`,
            [photoId, id, user.id]
        );

        if (photoResult.rows.length === 0) {
            return NextResponse.json(
                { error: "Photo not found" },
                { status: 404 }
            );
        }

        const { file_size: fileSize, file_path: filePath } =
            photoResult.rows[0];

        console.log(`[Delete Photo] Deleting photo ${photoId} from R2`);

        // Usuń zdjęcie z R2
        try {
            const key = extractKeyFromUrl(filePath);
            if (key) {
                await deleteFromR2(key);
                console.log(
                    `[Delete Photo] Successfully deleted from R2: ${key}`
                );

                // Usuń również miniaturkę (zamień .webp na -thumb.webp)
                const thumbnailKey = key.endsWith(".webp")
                    ? key.replace(".webp", "-thumb.webp")
                    : key.replace(/(\.[^.]+)$/, "-thumb$1");

                try {
                    await deleteFromR2(thumbnailKey);
                    console.log(
                        `[Delete Photo] Successfully deleted thumbnail from R2: ${thumbnailKey}`
                    );
                } catch (thumbError) {
                    // Miniaturka może nie istnieć dla starych zdjęć - ignoruj błąd
                    console.log(
                        `[Delete Photo] Thumbnail not found (OK for old photos): ${thumbnailKey}`
                    );
                }
            }
        } catch (error) {
            console.error("[Delete Photo] Error deleting from R2:", error);
            // Kontynuuj usuwanie z bazy mimo błędu w R2
        }

        // Usuń zdjęcie z bazy
        const deleteResult = await query(
            "DELETE FROM photos WHERE id = $1 AND user_id = $2 RETURNING id",
            [photoId, user.id]
        );

        if (deleteResult.rowCount === 0) {
            throw new Error("Nie udało się usunąć zdjęcia z bazy danych");
        }

        // Zaktualizuj storage_used
        await query(
            "UPDATE users SET storage_used = GREATEST(storage_used - $1, 0) WHERE id = $2",
            [fileSize, user.id]
        );

        console.log(
            `[Delete Photo] Successfully deleted photo ${photoId} from database`
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
