import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const body = await req.json();
        const { photoIds, onlyFavorites } = body;

        if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
            return NextResponse.json(
                { ok: false, message: "Brak zdjęć do pobrania" },
                { status: 400 }
            );
        }

        // Get photos from database
        const placeholders = photoIds.map((_, i) => `$${i + 1}`).join(",");
        const photosResult = await query(
            `SELECT id, file_path FROM photos WHERE id IN (${placeholders})`,
            photoIds
        );

        if (photosResult.rows.length === 0) {
            return NextResponse.json(
                { ok: false, message: "Nie znaleziono zdjęć" },
                { status: 404 }
            );
        }

        // Create ZIP file
        const zip = new JSZip();

        // Download and add each photo to ZIP
        for (const photo of photosResult.rows) {
            try {
                const response = await fetch(photo.file_path);
                if (!response.ok) continue;

                const arrayBuffer = await response.arrayBuffer();
                const filename =
                    photo.file_path.split("/").pop() || `photo-${photo.id}.jpg`;
                zip.file(filename, arrayBuffer);
            } catch (error) {
                console.error(`Error adding photo ${photo.id} to ZIP:`, error);
            }
        }

        // Generate ZIP
        const zipBlob = await zip.generateAsync({ type: "uint8array" });

        // Return ZIP file
        const { slug } = await params;
        const fileName = onlyFavorites
            ? `${slug}-ulubione.zip`
            : `${slug}-wszystkie.zip`;

        return new NextResponse(Buffer.from(zipBlob), {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "Content-Length": zipBlob.length.toString(),
            },
        });
    } catch (error) {
        console.error("Download ZIP error:", error);
        return NextResponse.json(
            { ok: false, message: "Błąd serwera" },
            { status: 500 }
        );
    }
}
