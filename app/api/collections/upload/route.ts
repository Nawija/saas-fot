import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import { uploadToR2, R2Paths, deleteFromR2, extractKeyFromUrl } from "@/lib/r2";
import { query } from "@/lib/db";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();

        if (!user) {
            return createErrorResponse("Nie zalogowano", 401);
        }
        const userResult = await query(
            "SELECT subscription_plan FROM users WHERE id = $1",
            [user.id]
        );
        const userPlan = userResult.rows[0]?.subscription_plan || "free";

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string;
        const collectionId = formData.get("collectionId") as string;

        if (!file) {
            return createErrorResponse("Brak pliku", 400);
        }
        if (!collectionId) {
            return createErrorResponse("Brak ID kolekcji", 400);
        }
        if (!file.type.startsWith("image/")) {
            return createErrorResponse("Plik musi być obrazem", 400);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let processedBuffer: Buffer;
        let contentType = "image/webp";
        let key: string;
        let thumbnailUrl: string | null = null; // Initialize thumbnail URL

        if (type === "hero") {
            const rotatedBuffer = await sharp(buffer)
                .rotate()
                .toBuffer({ resolveWithObject: false });

            const originalMeta = await sharp(rotatedBuffer).metadata();
            const originalWidth = originalMeta.width || 1920;
            const originalHeight = originalMeta.height || 1080;
            const originalAspect = originalWidth / originalHeight;

            const [heroDesktopBuffer, heroMobileBuffer] = await Promise.all([
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
            // Use unique keys for hero images so each upload creates a new
            // object instead of overwriting the previous one. This prevents
            // browser/CDN caching issues where the URL stays the same.
            const ts = Date.now();
            const keyDesktop = `users/${user.id}/collections/${collectionId}/hero-${ts}.webp`;
            const keyMobile = `users/${user.id}/collections/${collectionId}/hero-mobile-${ts}.webp`;

            const [urlDesktop, urlMobile] = await Promise.all([
                uploadToR2(heroDesktopBuffer, keyDesktop, contentType),
                uploadToR2(heroMobileBuffer, keyMobile, contentType),
            ]);

            // After successful upload, attempt to delete previous hero files (if any)
            try {
                const colRes = await query(
                    "SELECT hero_image, hero_image_mobile FROM collections WHERE id = $1",
                    [parseInt(collectionId)]
                );

                const prev = colRes.rows[0];
                if (prev) {
                    const prevDesktopUrl = prev.hero_image as string | null;
                    const prevMobileUrl = prev.hero_image_mobile as
                        | string
                        | null;

                    const prevDesktopKey = prevDesktopUrl
                        ? extractKeyFromUrl(
                              prevDesktopUrl.split("?")[0] as string
                          )
                        : null;
                    const prevMobileKey = prevMobileUrl
                        ? extractKeyFromUrl(
                              prevMobileUrl.split("?")[0] as string
                          )
                        : null;

                    // Only delete if key exists and is different from newly uploaded keys
                    if (prevDesktopKey && prevDesktopKey !== keyDesktop) {
                        await deleteFromR2(prevDesktopKey);
                    }
                    if (prevMobileKey && prevMobileKey !== keyMobile) {
                        await deleteFromR2(prevMobileKey);
                    }
                }
            } catch (deleteErr) {
                console.warn(
                    "Failed to delete previous hero images:",
                    deleteErr
                );
                // Don't fail the whole request if deletion fails
            }

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
                width,
                height,
            });
        } else {
            const targetMaxWidth = 1300;
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
                // Fallback: tylko konwersja do PNG bez rotate
                try {
                    rotatedBuffer = await sharp(buffer, {
                        failOn: "none",
                        limitInputPixels: false,
                    })
                        .png()
                        .toBuffer();
                } catch (finalError: any) {
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

            let resizedBuffer: Buffer;
            let actualWidth: number;
            let actualHeight: number;

            if (!canProcessWithSharp) {
                // Nie możemy przetworzyć - użyj oryginału
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

            let composed = canProcessWithSharp ? sharp(resizedBuffer) : null;

            // Dla planu FREE dodaj watermark z pliku public/watermark.svg (tylko jeśli możemy używać Sharp)
            if (userPlan === "free" && canProcessWithSharp && composed) {
                try {
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

                    if (top < 0 || left < 0) {
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
                } catch (watermarkError: any) {
                    // Jeśli watermark się nie uda, po prostu kontynuuj bez niego
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

            // Użyj timestamp jako ID
            const fileExt = canProcessWithSharp
                ? "webp"
                : file.name.split(".").pop() || "jpg";
            key = R2Paths.collectionPhoto(
                user.id,
                parseInt(collectionId),
                Date.now(),
                fileExt
            );

            // GENERUJ MINIATURKĘ (400px width, WebP, quality 75)
            let thumbnailBuffer: Buffer | null = null;
            let thumbnailKey: string | null = null;

            if (canProcessWithSharp) {
                try {
                    thumbnailBuffer = await sharp(resizedBuffer)
                        .resize(400, null, {
                            fit: "inside",
                            withoutEnlargement: true,
                        })
                        .webp({ quality: 75, effort: 2 })
                        .toBuffer();

                    // Upload miniaturki do R2 z suffixem -thumb
                    thumbnailKey = key.replace(`.${fileExt}`, `t.webp`);
                    thumbnailUrl = await uploadToR2(
                        thumbnailBuffer,
                        thumbnailKey,
                        "image/webp"
                    );
                } catch (thumbError) {
                    // Jeśli miniaturka się nie uda, kontynuuj bez niej
                    console.warn("Failed to generate thumbnail:", thumbError);
                }
            }
        }

        // Pobierz wymiary przetworzonego obrazu
        const metadata = await sharp(processedBuffer).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        // Upload do R2
        const url = await uploadToR2(processedBuffer, key, contentType);
        const size = processedBuffer.length + 1634569;

        // Standardowa odpowiedź
        return NextResponse.json({
            ok: true,
            url,
            thumbnailUrl,
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
