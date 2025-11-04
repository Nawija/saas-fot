import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import { uploadToR2, R2Paths } from "@/lib/r2";
import { query } from "@/lib/db";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";
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
        const saveToDb = formData.get("saveToDb") as string; // "true" jeśli chcemy zapisać od razu w bazie

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
            // Najpierw rotate dla poprawnej orientacji (szybki pipeline)
            const rotatedBuffer = await sharp(buffer)
                .rotate()
                .toBuffer({ resolveWithObject: false });

            // Pobierz metadane oryginału
            const originalMeta = await sharp(rotatedBuffer).metadata();
            const originalWidth = originalMeta.width || 1920;
            const originalHeight = originalMeta.height || 1080;
            const originalAspect = originalWidth / originalHeight;

            // Przetwarzaj OBA obrazy RÓWNOLEGLE dla szybkości
            const [heroDesktopBuffer, heroMobileBuffer] = await Promise.all([
                // Hero Desktop - 2560x1440 (2K) - Landscape 16:9
                // Optymalne dla webowych wyświetlaczy, lżejsze niż 4K
                // fit: 'inside' zachowuje proporcje bez przycinania
                // position: 'centre' centruje obraz
                sharp(rotatedBuffer)
                    .resize(2560, 1440, {
                        fit: originalAspect > 1.5 ? "inside" : "cover",
                        position: "centre",
                        withoutEnlargement: false,
                        kernel: sharp.kernel.lanczos3, // Najlepsza jakość
                    })
                    .webp({
                        quality: 90, // Świetna jakość z dobrą kompresją
                        effort: 4,
                        smartSubsample: true,
                    })
                    .toBuffer(),

                // Hero Mobile - 1080x1920 - Portrait 9:16 dla pełnego ekranu
                // Pionowa orientacja idealna dla telefonów w trybie portrait
                // fit: 'cover' wypełnia cały obszar, przycinając minimalnie
                sharp(rotatedBuffer)
                    .resize(1080, 1920, {
                        fit: originalAspect < 1 ? "inside" : "cover",
                        position: "centre",
                        withoutEnlargement: false,
                        kernel: sharp.kernel.lanczos3,
                    })
                    .webp({
                        quality: 88, // Nieco niższa jakość dla mobile (mniejszy ekran)
                        effort: 4,
                        smartSubsample: true,
                    })
                    .toBuffer(),
            ]);

            // Upload obu wersji RÓWNOLEGLE do R2
            const keyDesktop = R2Paths.collectionHero(
                user.id,
                parseInt(collectionId)
            );
            const keyMobile = R2Paths.collectionHeroMobile(
                user.id,
                parseInt(collectionId)
            );

            console.log("[Hero Upload] Desktop key:", keyDesktop);
            console.log("[Hero Upload] Mobile key:", keyMobile);
            console.log(
                "[Hero Upload] Desktop size:",
                heroDesktopBuffer.length,
                "bytes"
            );
            console.log(
                "[Hero Upload] Mobile size:",
                heroMobileBuffer.length,
                "bytes"
            );

            const [urlDesktop, urlMobile] = await Promise.all([
                uploadToR2(heroDesktopBuffer, keyDesktop, contentType),
                uploadToR2(heroMobileBuffer, keyMobile, contentType),
            ]);

            console.log("[Hero Upload] Desktop URL:", urlDesktop);
            console.log("[Hero Upload] Mobile URL:", urlMobile);

            // Zwróć desktop URL jako główny, mobile w metadata
            processedBuffer = heroDesktopBuffer;
            key = keyDesktop;

            // Pobierz wymiary desktop version
            const metadata = await sharp(processedBuffer).metadata();
            const width = metadata.width || 0;
            const height = metadata.height || 0;

            return NextResponse.json({
                ok: true,
                url: urlDesktop,
                urlMobile: urlMobile,
                size: heroDesktopBuffer.length + heroMobileBuffer.length,
                width,
                height,
            });
        } else {
            // Regular photo - 1300px szerokości (optymalne dla web)
            const targetMaxWidth = 1300;

            // Najpierw rotate() aby uzyskać poprawne wymiary po korekcie orientacji
            const rotatedBuffer = await sharp(buffer).rotate().toBuffer();
            const inputMeta = await sharp(rotatedBuffer).metadata();

            const inW = inputMeta.width || targetMaxWidth;
            const inH = inputMeta.height || Math.round(targetMaxWidth * 0.75);
            const targetW = Math.min(inW, targetMaxWidth);
            const scale = targetW / inW;
            const targetH = Math.max(1, Math.round(inH * scale));

            let composed = sharp(rotatedBuffer).resize(targetMaxWidth, null, {
                fit: "inside",
                withoutEnlargement: true,
                kernel: sharp.kernel.lanczos3, // Szybszy kernel
            });

            // Dla planu FREE dodaj watermark z pliku public/watermark.svg
            if (userPlan === "free") {
                const watermarkPath = path.join(
                    process.cwd(),
                    "public",
                    "watermark.svg"
                );
                const svgBuffer = await fs.readFile(watermarkPath);

                // Skala watermarku ~16% szerokości, z bezpiecznymi limitami
                const overlayW = Math.max(
                    60,
                    Math.min(
                        Math.floor(targetW * 0.4),
                        Math.round(targetW * 0.16)
                    )
                );
                const wmPng = await sharp(svgBuffer)
                    .resize({ width: overlayW })
                    .png()
                    .toBuffer();
                const wmMeta = await sharp(wmPng).metadata();
                const wmW = wmMeta.width || overlayW;
                const wmH = wmMeta.height || Math.round(overlayW * 0.3);

                // Tło pod watermark (dla widoczności na jasnym tle)
                let edge = Math.max(
                    8,
                    Math.min(32, Math.round(targetW * 0.015))
                ); // od krawędzi zdjęcia
                let pad = Math.max(6, Math.min(18, Math.round(targetW * 0.01))); // wewnętrzny padding tła
                let bgW = wmW + pad * 2;
                let bgH = wmH + pad * 2;

                // SVG tła z zaokrągleniami i przezroczystą czernią
                const bgSvg = Buffer.from(
                    `<svg width="${bgW}" height="${bgH}" viewBox="0 0 ${bgW} ${bgH}" xmlns="http://www.w3.org/2000/svg">
                    </svg>`
                );

                // Pozycja w prawym-dolnym rogu z marginesem
                let top = targetH - bgH - edge;
                let left = targetW - bgW - edge;
                if (top < 0 || left < 0) {
                    // Dla bardzo małych zdjęć – zredukuj padding i sklej do krawędzi
                    edge = Math.max(4, edge);
                    pad = Math.max(4, pad);
                    bgW = wmW + pad * 2;
                    bgH = wmH + pad * 2;
                    top = Math.max(0, targetH - bgH - edge);
                    left = Math.max(0, targetW - bgW - edge);
                }

                composed = composed.composite([
                    { input: bgSvg, top, left },
                    { input: wmPng, top: top + pad, left: left + pad },
                ]);
            }

            processedBuffer = await composed
                .webp({
                    quality: 85,
                    effort: 3, // Szybsze przetwarzanie dla zwykłych zdjęć
                })
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

        // Pobierz wymiary przetworzonego obrazu
        const metadata = await sharp(processedBuffer).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        // Upload do R2
        const url = await uploadToR2(processedBuffer, key, contentType);
        const size = processedBuffer.length;

        // Dla saveToDb === "true" zwróć tylko dane, a zapis w bazie zrób batch'em po stronie klienta
        // To oszczędza database queries (taniej dla SaaS!)

        // Standardowa odpowiedź dla hero images lub gdy saveToDb !== "true"
        return NextResponse.json({
            ok: true,
            url,
            size,
            width,
            height,
        });
    } catch (error: any) {
        // Log error in development, silently fail in production
        if (process.env.NODE_ENV === "development") {
            console.error("Upload error:", error);
        }
        return createErrorResponse("Błąd uploadu", 500);
    }
}
