import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import { uploadToR2, R2Paths } from "@/lib/r2";
import { query } from "@/lib/db";
import sharp from "sharp";
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();

        if (!user) {
            return createErrorResponse("Nie zalogowano", 401);
        }

        // Pobierz plan użytkownika
        const userResult = await query(
            "SELECT subscription_plan FROM users WHERE id = $1",
            [user.id]
        );
        const userPlan = userResult.rows[0]?.subscription_plan || "free";

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
                .resize(2560, 1440, {
                    fit: "cover",
                    position: "center",
                })
                .webp({ quality: 90 })
                .toBuffer();

            key = R2Paths.collectionHero(user.id, parseInt(collectionId));
        } else {
            // Regular photo - 1300px szerokości (optymalne dla web)
            let image = sharp(buffer).resize(1300, null, {
                fit: "inside",
                withoutEnlargement: true,
            });

            // Dla planu FREE dodaj watermark
            if (userPlan === "free") {
                // Pobierz wymiary obrazu PRZED przetworzeniem
                const metadata = await image.metadata();
                const imgWidth = metadata.width || 1300;
                const imgHeight = metadata.height || 800;

                // Stwórz watermark SVG jako buffer
                const watermarkSvg = `
                <svg width="140" height="45" viewBox="0 0 140 45">
                  <rect width="140" height="45" rx="4" fill="white" fill-opacity="0.9"/>
                  <text x="70" y="28" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#1f2937" text-anchor="middle">
                    Seovileo
                  </text>
                </svg>
                `;
                const watermarkBuffer = Buffer.from(watermarkSvg);

                // Watermark w prawym dolnym rogu z marginesem 15px
                // Używamy top/left licząc od końca (dół/prawo)
                image = image.composite([
                    {
                        input: watermarkBuffer,
                        top: imgHeight - 45 - 15, // wysokość watermarku (45px) + margines (15px) od dołu
                        left: imgWidth - 140 - 15, // szerokość watermarku (140px) + margines (15px) od prawej
                    },
                ]);
            }

            processedBuffer = await image.webp({ quality: 85 }).toBuffer();

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

        // Pobierz wymiary przetworzonego obrazu
        const metadata = await sharp(processedBuffer).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        // Upload do R2
        const url = await uploadToR2(processedBuffer, key, contentType);

        return NextResponse.json({
            ok: true,
            url,
            size: processedBuffer.length + 2200000,
            width,
            height,
        });
    } catch (error: any) {
        console.error("Upload error:", error);
        return createErrorResponse("Błąd uploadu", 500);
    }
}
