import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import jwt from "jsonwebtoken";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const url = new URL(req.url);
        const subdomain = url.searchParams.get("subdomain");

        // Pobierz kolekcję
        let collectionResult;
        if (subdomain) {
            collectionResult = await query(
                `SELECT c.id, c.name, c.description, c.hero_image, c.hero_image_mobile, c.hero_template, c.hero_font, c.is_public, c.password_hash
                FROM collections c
                INNER JOIN users u ON c.user_id = u.id
                WHERE u.username = $1 AND c.slug = $2`,
                [subdomain, slug]
            );
        } else {
            collectionResult = await query(
                `SELECT id, name, description, hero_image, hero_image_mobile, hero_template, hero_font, is_public, password_hash
                FROM collections 
                WHERE slug = $1`,
                [slug]
            );
        }

        if (collectionResult.rows.length === 0) {
            return createErrorResponse("Nie znaleziono galerii", 404);
        }

        const collection = collectionResult.rows[0];

        // Sprawdź dostęp jeśli galeria jest chroniona hasłem
        if (collection.password_hash) {
            const authHeader = req.headers.get("authorization");

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return createErrorResponse("Brak autoryzacji", 401);
            }

            const token = authHeader.substring(7);
            const secret = process.env.JWT_SECRET!;

            try {
                const decoded = jwt.verify(token, secret) as any;
                if (decoded.collectionId !== collection.id) {
                    return createErrorResponse("Nieprawidłowy token", 401);
                }
            } catch (error) {
                return createErrorResponse("Nieprawidłowy token", 401);
            }
        }

        // Pobierz identyfikator gościa (IP)
        const guestId = req.headers.get("x-forwarded-for") || "unknown";

        // Pobierz zdjęcia z informacją o polubienia przez tego gościa
        const photosResult = await query(
            `SELECT 
                p.id, p.file_path, p.thumbnail_path, p.width, p.height,
                COUNT(pl.id) as likes,
                CASE WHEN guest_likes.id IS NOT NULL THEN true ELSE false END as is_liked
            FROM photos p
            LEFT JOIN photo_likes pl ON p.id = pl.photo_id
            LEFT JOIN photo_likes guest_likes ON p.id = guest_likes.photo_id AND guest_likes.guest_identifier = $2
            WHERE p.collection_id = $1
            GROUP BY p.id, guest_likes.id
            ORDER BY p.uploaded_at DESC`,
            [collection.id, guestId]
        );

        const photos = photosResult.rows.map((photo) => ({
            id: photo.id,
            file_path: photo.file_path,
            thumbnail_path: photo.thumbnail_path,
            width: photo.width,
            height: photo.height,
            likes: parseInt(photo.likes) || 0,
            isLiked: photo.is_liked || false,
        }));

        return NextResponse.json({
            ok: true,
            collection: {
                id: collection.id,
                name: collection.name,
                description: collection.description,
                hero_image: collection.hero_image,
                hero_image_mobile: collection.hero_image_mobile,
                hero_template: collection.hero_template,
                hero_font: collection.hero_font,
            },
            photos,
        });
    } catch (error: any) {
        console.error("Get gallery photos error:", error);
        return createErrorResponse("Błąd pobierania zdjęć", 500);
    }
}
