// app/api/collections/[id]/photos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUser } from "@/lib/auth/getUser";

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
            `SELECT id, file_name, file_path, file_size, created_at 
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

        // Dodaj zdjęcie
        const result = await query(
            `INSERT INTO photos (collection_id, user_id, file_name, file_path, file_size) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
            [id, user.id, file_name, file_path, file_size]
        );

        // Zaktualizuj storage_used
        await query(
            "UPDATE users SET storage_used = storage_used + $1 WHERE id = $2",
            [file_size, user.id]
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
