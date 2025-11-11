import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUser } from "@/lib/auth/getUser";
import { createErrorResponse } from "@/lib/utils/apiHelpers";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const collectionId = parseInt(id);
        if (isNaN(collectionId)) {
            return NextResponse.json(
                { error: "Invalid collection ID" },
                { status: 400 }
            );
        }

        // Verify collection belongs to user
        const collRes = await query(
            "SELECT id FROM collections WHERE id = $1 AND user_id = $2",
            [collectionId, user.id]
        );

        if (collRes.rows.length === 0) {
            return NextResponse.json(
                { error: "Collection not found or unauthorized" },
                { status: 404 }
            );
        }

        // Return all liked photos (no pagination). Thumbnails will be lazy-loaded on the client.
        // total liked count
        const totalRes = await query(
            `SELECT COUNT(DISTINCT p.id) as count
             FROM photos p
             JOIN photo_likes pl ON p.id = pl.photo_id
             WHERE p.collection_id = $1`,
            [collectionId]
        );
        const total = parseInt(totalRes.rows[0].count) || 0;

        // Get all photos with like counts (only those with > 0 likes)
        const result = await query(
            `SELECT 
                p.id,
                p.file_path,
                p.thumbnail_path,
                p.file_name,
                p.width,
                p.height,
                COUNT(pl.id) as like_count
            FROM photos p
            LEFT JOIN photo_likes pl ON p.id = pl.photo_id
            WHERE p.collection_id = $1
            GROUP BY p.id, p.file_path, p.thumbnail_path, p.file_name, p.width, p.height
            HAVING COUNT(pl.id) > 0
            ORDER BY COUNT(pl.id) DESC, p.uploaded_at DESC`,
            [collectionId]
        );

        const photos = result.rows.map((row: any) => ({
            id: row.id,
            file_path: row.file_path,
            thumbnail_path: row.thumbnail_path,
            file_name: row.file_name,
            width: row.width,
            height: row.height,
            likeCount: parseInt(row.like_count) || 0,
        }));

        return NextResponse.json({ ok: true, photos, total });
    } catch (error: any) {
        console.error("Error fetching liked photos:", error);
        return createErrorResponse("Błąd pobierania polubionych zdjęć", 500);
    }
}
