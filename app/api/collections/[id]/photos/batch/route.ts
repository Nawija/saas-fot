// app/api/collections/[id]/photos/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUser } from "@/lib/auth/getUser";
import { canUploadFile } from "@/lib/storage";

interface PhotoData {
    file_name: string;
    file_path: string;
    file_size: number;
    width?: number;
    height?: number;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { photos } = (await request.json()) as { photos: PhotoData[] };

        if (!photos || !Array.isArray(photos) || photos.length === 0) {
            return NextResponse.json(
                { error: "No photos provided" },
                { status: 400 }
            );
        }

        // Sprawdź czy kolekcja należy do użytkownika
        const collectionCheck = await query(
            "SELECT id FROM collections WHERE id = $1 AND user_id = $2",
            [id, user.id]
        );

        if (collectionCheck.rows.length === 0) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            );
        }

        // Policz całkowity rozmiar
        const totalSize = photos.reduce((sum, p) => sum + p.file_size, 0);

        // Sprawdź czy użytkownik ma wystarczająco miejsca
        const hasSpace = await canUploadFile(user.id, totalSize);
        if (!hasSpace) {
            return NextResponse.json(
                {
                    error: "Brak miejsca",
                    message: "Przekroczono limit storage. Zakup większy plan.",
                    upgradeRequired: true,
                },
                { status: 413 }
            );
        }

        // 💰 BATCH INSERT - wszystkie zdjęcia jednym zapytaniem!
        // VALUES ($1, $2, $3, ...), ($4, $5, $6, ...), ...
        const values: any[] = [];
        const valuePlaceholders: string[] = [];
        let paramIndex = 1;

        photos.forEach((photo) => {
            valuePlaceholders.push(
                `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
            );
            values.push(
                id,
                user.id,
                photo.file_name,
                photo.file_path,
                photo.file_size,
                photo.width || null,
                photo.height || null
            );
        });

        const insertQuery = `
            INSERT INTO photos (collection_id, user_id, file_name, file_path, file_size, width, height) 
            VALUES ${valuePlaceholders.join(", ")}
            RETURNING *
        `;

        const result = await query(insertQuery, values);

        // Zaktualizuj storage_used JEDNYM zapytaniem
        await query(
            "UPDATE users SET storage_used = storage_used + $1 WHERE id = $2",
            [totalSize, user.id]
        );

        return NextResponse.json({
            ok: true,
            count: result.rows.length,
            photos: result.rows,
        });
    } catch (error) {
        console.error("Batch add photos error:", error);
        return NextResponse.json(
            { error: "Failed to add photos" },
            { status: 500 }
        );
    }
}
