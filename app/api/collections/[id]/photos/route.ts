// app/api/collections/[id]/photos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUser } from "@/lib/auth/getUser";
import { canUploadFile } from "@/lib/storage";

export async function GET(
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

        // Pobierz zdjęcia
        const result = await query(
            `SELECT id, file_name, file_path, 
             CAST(file_size AS INTEGER) as file_size, 
             created_at 
       FROM photos 
       WHERE collection_id = $1 
       ORDER BY created_at DESC`,
            [id]
        );

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Get photos error:", error);
        return NextResponse.json(
            { error: "Failed to fetch photos" },
            { status: 500 }
        );
    }
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

        const { file_name, file_path, file_size } = await request.json();

        // Upewnij się że file_size jest liczbą
        const fileSizeNum = parseInt(file_size);

        if (isNaN(fileSizeNum) || fileSizeNum < 0) {
            return NextResponse.json(
                { error: "Invalid file size" },
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

        // Sprawdź czy użytkownik ma wystarczająco miejsca
        const hasSpace = await canUploadFile(user.id, fileSizeNum);
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

        // Dodaj zdjęcie
        const result = await query(
            `INSERT INTO photos (collection_id, user_id, file_name, file_path, file_size) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
            [id, user.id, file_name, file_path, fileSizeNum]
        );

        // Zaktualizuj storage_used
        await query(
            "UPDATE users SET storage_used = storage_used + $1 WHERE id = $2",
            [fileSizeNum, user.id]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Add photo error:", error);
        return NextResponse.json(
            { error: "Failed to add photo" },
            { status: 500 }
        );
    }
}
