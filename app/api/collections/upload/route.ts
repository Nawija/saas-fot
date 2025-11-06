import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import { uploadToR2, R2Paths } from "@/lib/r2";
import { query } from "@/lib/db";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";

// Zwiększ limit body size do 50MB dla dużych zdjęć
export const runtime = "nodejs";
export const maxDuration = 60; // 60 sekund timeout
export const dynamic = "force-dynamic";

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
                // fit: 'inside' zachowuje proporcje bez przycinania
                // position: 'centre' centruje obraz
                sharp(rotatedBuffer)
                    .resize(2560, 1440, {
                        fit: originalAspect > 1.5 ? "inside" : "cover",
                        position: "centre",
                        withoutEnlargement: false,
                        kernel: sharp.kernel.lanczos3,
                    })
                    .webp({
                        quality: 90,
                        effort: 4,
                        smartSubsample: true,
                    })
                    .toBuffer(),

                sharp(rotatedBuffer)
                    .resize(1080, 1920, {
                        fit: originalAspect < 1 ? "inside" : "cover",
                        position: "centre",
                        withoutEnlargement: false,
                        kernel: sharp.kernel.lanczos3,
                    })
                    .webp({
                        quality: 88,
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
            console.log("[PHOTO UPLOAD] Starting regular photo processing");
            const targetMaxWidth = 1300;

            // Najpierw konwertuj na PNG (uniwersalny format), potem rotate
            // To rozwiązuje problemy z HEIF/HEIC i innymi egzotycznymi formatami
            let rotatedBuffer: Buffer;
            let canProcessWithSharp = true;

            try {
                rotatedBuffer = await sharp(buffer, {
                    failOn: "none", // Ignoruj drobne błędy w HEIF
                    limitInputPixels: false,
                })
                    .png() // Konwertuj na PNG najpierw
                    .rotate()
                    .toBuffer();
            } catch (heifError: any) {
                console.log(
                    "[PHOTO UPLOAD] HEIF decode error, trying simpler approach:",
                    heifError.message
                );
                // Fallback: tylko konwersja do PNG bez rotate
                try {
                    rotatedBuffer = await sharp(buffer, {
                        failOn: "none",
                        limitInputPixels: false,
                    })
                        .png()
                        .toBuffer();
                } catch (finalError: any) {
                    console.log(
                        "[PHOTO UPLOAD] Cannot process with Sharp, uploading original:",
                        finalError.message
                    );
                    // Ostateczny fallback: użyj oryginalnego buffera bez przetwarzania
                    rotatedBuffer = buffer;
                    canProcessWithSharp = false;
                    contentType = file.type; // Zachowaj oryginalny typ MIME
                }
            }

            let inputMeta: any = { width: 0, height: 0 };
            if (canProcessWithSharp) {
                inputMeta = await sharp(rotatedBuffer).metadata();
            }
            console.log(
                "[PHOTO UPLOAD] Input metadata:",
                inputMeta.width,
                "x",
                inputMeta.height
            );

            let resizedBuffer: Buffer;
            let actualWidth: number;
            let actualHeight: number;

            if (!canProcessWithSharp) {
                // Nie możemy przetworzyć - użyj oryginału
                console.log(
                    "[PHOTO UPLOAD] Using original buffer without processing"
                );
                resizedBuffer = rotatedBuffer;
                actualWidth = inputMeta.width || 1300;
                actualHeight = inputMeta.height || 1000;
            } else {
                const inW = inputMeta.width || targetMaxWidth;
                const inH =
                    inputMeta.height || Math.round(targetMaxWidth * 0.75);
                const targetW = Math.min(inW, targetMaxWidth);
                const scale = targetW / inW;
                const targetH = Math.max(1, Math.round(inH * scale));

                // Najpierw resize, potem pobierz rzeczywiste wymiary
                resizedBuffer = await sharp(rotatedBuffer)
                    .resize(targetMaxWidth, null, {
                        fit: "inside",
                        withoutEnlargement: true,
                        kernel: sharp.kernel.lanczos3,
                    })
                    .toBuffer();

                const resizedMeta = await sharp(resizedBuffer).metadata();
                actualWidth = resizedMeta.width || targetW;
                actualHeight = resizedMeta.height || targetH;
            }

            console.log(
                "[PHOTO UPLOAD] Resized to:",
                actualWidth,
                "x",
                actualHeight
            );
            console.log("[PHOTO UPLOAD] User plan:", userPlan);

            let composed = canProcessWithSharp ? sharp(resizedBuffer) : null;

            // Dla planu FREE dodaj watermark z pliku public/watermark.svg (tylko jeśli możemy używać Sharp)
            if (userPlan === "free" && canProcessWithSharp && composed) {
                try {
                    console.log(
                        "[PHOTO UPLOAD] Adding watermark for FREE plan"
                    );
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
                            Math.floor(actualWidth * 0.4),
                            Math.round(actualWidth * 0.16)
                        )
                    );
                    const wmPng = await sharp(svgBuffer)
                        .resize({ width: overlayW })
                        .png()
                        .toBuffer();
                    const wmMeta = await sharp(wmPng).metadata();
                    const wmW = wmMeta.width || overlayW;
                    const wmH = wmMeta.height || Math.round(overlayW * 0.3);

                    console.log(
                        "[PHOTO UPLOAD] Watermark size:",
                        wmW,
                        "x",
                        wmH
                    );

                    // Tło pod watermark (dla widoczności na jasnym tle)
                    let edge = Math.max(
                        8,
                        Math.min(32, Math.round(actualWidth * 0.015))
                    ); // od krawędzi zdjęcia
                    let pad = Math.max(
                        6,
                        Math.min(18, Math.round(actualWidth * 0.01))
                    ); // wewnętrzny padding tła
                    let bgW = wmW + pad * 2;
                    let bgH = wmH + pad * 2;

                    // SVG tła z zaokrągleniami i przezroczystą czernią
                    const bgSvg = Buffer.from(
                        `<svg width="${bgW}" height="${bgH}" viewBox="0 0 ${bgW} ${bgH}" xmlns="http://www.w3.org/2000/svg">
                    </svg>`
                    );

                    // Pozycja w prawym-dolnym rogu z marginesem
                    let top = actualHeight - bgH - edge;
                    let left = actualWidth - bgW - edge;

                    console.log("[PHOTO UPLOAD] Watermark position:", {
                        top,
                        left,
                        edge,
                        pad,
                    });

                    if (top < 0 || left < 0) {
                        console.log("[PHOTO UPLOAD] Adjusting for small image");
                        // Dla bardzo małych zdjęć – zredukuj padding i sklej do krawędzi
                        edge = Math.max(4, edge);
                        pad = Math.max(4, pad);
                        bgW = wmW + pad * 2;
                        bgH = wmH + pad * 2;
                        top = Math.max(0, actualHeight - bgH - edge);
                        left = Math.max(0, actualWidth - bgW - edge);
                    }

                    composed = composed.composite([
                        { input: bgSvg, top, left },
                        { input: wmPng, top: top + pad, left: left + pad },
                    ]);

                    console.log("[PHOTO UPLOAD] Watermark added successfully");
                } catch (watermarkError: any) {
                    // Jeśli watermark się nie uda, po prostu kontynuuj bez niego
                    console.log(
                        "[PHOTO UPLOAD] Watermark failed, continuing without it:",
                        watermarkError.message
                    );
                }
            }

            if (canProcessWithSharp && composed) {
                processedBuffer = await composed
                    .webp({
                        quality: 85,
                        effort: 3, // Szybsze przetwarzanie dla zwykłych zdjęć
                    })
                    .toBuffer();
            } else {
                // Użyj oryginalnego buffera bez konwersji
                processedBuffer = resizedBuffer;
            }

            // Użyj ID zdjęcia lub timestamp
            const fileExt = canProcessWithSharp
                ? "webp"
                : file.name.split(".").pop() || "jpg";
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
        const size = processedBuffer.length + 999999;

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
            console.error("[UPLOAD API ERROR]:", error);
            console.error("Error stack:", error.stack);
        }
        return createErrorResponse(
            process.env.NODE_ENV === "development"
                ? `Błąd uploadu: ${error.message}`
                : "Błąd uploadu",
            500
        );
    }
}
