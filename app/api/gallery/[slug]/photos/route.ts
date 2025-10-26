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

        // Pobierz kolekcję
        const collectionResult = await query(
            `SELECT id, name, description, hero_image, hero_template, is_public, password_hash 
            FROM collections 
            WHERE slug = $1`,
            [slug]
        );

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

        // Pobierz zdjęcia
        const photosResult = await query(
            `SELECT 
                p.id, p.file_path, p.thumbnail_path, p.width, p.height,
                COUNT(pl.id) as likes
            FROM photos p
            LEFT JOIN photo_likes pl ON p.id = pl.photo_id
            WHERE p.collection_id = $1
            GROUP BY p.id
            ORDER BY p.uploaded_at DESC`,
            [collection.id]
        );

        // Dodaj informację czy gość polubił (na podstawie IP lub cookie)
        const photos = photosResult.rows.map((photo) => ({
            ...photo,
            likes: parseInt(photo.likes) || 0,
            isLiked: false, // TODO: sprawdź na podstawie guest_identifier
        }));

        return NextResponse.json({
            ok: true,
            collection: {
                id: collection.id,
                name: collection.name,
                description: collection.description,
                hero_image: collection.hero_image,
                hero_template: collection.hero_template,
            },
            photos,
        });
    } catch (error: any) {
        console.error("Get gallery photos error:", error);
        return createErrorResponse("Błąd pobierania zdjęć", 500);
    }
}
