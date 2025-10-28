import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { query } from "@/lib/db";
import JSZip from "jszip";

export async function GET(
    request: NextRequest,
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
        const collectionId = parseInt(id, 10);

        // Sprawdź czy kolekcja należy do użytkownika
        const collectionResult = await query(
            "SELECT * FROM collections WHERE id = $1 AND user_id = $2",
            [collectionId, user.id]
        );

        if (!collectionResult.rows || collectionResult.rows.length === 0) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            );
        }

        const collection = collectionResult.rows[0];

        // Pobierz wszystkie zdjęcia z kolekcji
        const photosResult = await query(
            "SELECT * FROM photos WHERE collection_id = $1 ORDER BY created_at DESC",
            [collectionId]
        );

        if (!photosResult.rows || photosResult.rows.length === 0) {
            return NextResponse.json(
                { error: "No photos in collection" },
                { status: 404 }
            );
        }

        const photos = photosResult.rows;

        // Utwórz ZIP
        const zip = new JSZip();

        // Pobierz każde zdjęcie i dodaj do ZIP
        for (const photo of photos) {
            try {
                const response = await fetch(photo.file_path);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    zip.file(photo.file_name, arrayBuffer);
                }
            } catch (error) {
                console.error(`Failed to fetch ${photo.file_name}:`, error);
            }
        }

        // Wygeneruj ZIP
        const zipBuffer = await zip.generateAsync({ type: "uint8array" });

        // Zwróć ZIP jako plik do pobrania
        return new NextResponse(Buffer.from(zipBuffer), {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${
                    collection.slug || "photos"
                }.zip"`,
            },
        });
    } catch (error) {
        console.error("Error generating ZIP:", error);
        return NextResponse.json(
            { error: "Failed to generate ZIP" },
            { status: 500 }
        );
    }
}
