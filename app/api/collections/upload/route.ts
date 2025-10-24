import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import { uploadToR2, R2Paths } from "@/lib/r2";
import sharp from "sharp";

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();

        if (!user) {
            return createErrorResponse("Nie zalogowano", 401);
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string; // "hero" or "photo"
        const collectionId = formData.get("collectionId") as string; // ID kolekcji
        const photoId = formData.get("photoId") as string; // ID zdjęcia (dla photos)

        if (!file) {
            return createErrorResponse("Brak pliku", 400);
        }

        if (!collectionId) {
            return createErrorResponse("Brak ID kolekcji", 400);
        }

        // Sprawdź typ pliku
        if (!file.type.startsWith("image/")) {
            return createErrorResponse("Plik musi być obrazem", 400);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let processedBuffer: Buffer;
        let contentType = "image/webp";
        let key: string;

        if (type === "hero") {
            // Hero image - 1920x1080
            processedBuffer = await sharp(buffer)
                .resize(1920, 1080, {
                    fit: "cover",
                    position: "center",
                })
                .webp({ quality: 90 })
                .toBuffer();

            key = R2Paths.collectionHero(user.id, parseInt(collectionId));
        } else {
            // Regular photo - 1200px szerokości
            processedBuffer = await sharp(buffer)
                .resize(1200, null, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality: 85 })
                .toBuffer();

            // Użyj ID zdjęcia lub timestamp
            const fileExt = "webp";
            const id = photoId || Date.now();
            key = R2Paths.collectionPhoto(
                user.id,
                parseInt(collectionId),
                parseInt(id.toString()),
                fileExt
            );
        }

        // Upload do R2
        const url = await uploadToR2(processedBuffer, key, contentType);

        return NextResponse.json({
            ok: true,
            url,
            size: processedBuffer.length,
        });
    } catch (error: any) {
        console.error("Upload error:", error);
        return createErrorResponse("Błąd uploadu", 500);
    }
}
