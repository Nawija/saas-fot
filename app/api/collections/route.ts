import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import { withMiddleware } from "@/lib/utils/apiMiddleware";
import {
    getUserCollections,
    canCreateGallery,
    hasPremiumAccess,
} from "@/lib/utils/userHelpers";

export const GET = withMiddleware(
    async (req, { user }) => {
        const collections = await getUserCollections(user!.id);

        return NextResponse.json({
            ok: true,
            collections,
        });
    },
    { requireAuth: true }
);

export const POST = withMiddleware(
    async (req, { user }) => {
        const { name, slug, description, hero_image, password, is_public } =
            await req.json();

        if (!name || !slug) {
            return createErrorResponse("Nazwa i slug są wymagane", 400);
        }

        // Sprawdź limit galerii
        const galleryCheck = await canCreateGallery(user!.id);

        if (!galleryCheck.allowed) {
            return NextResponse.json(
                {
                    error: "Osiągnięto limit galerii",
                    message: `Twój plan umożliwia maksymalnie ${
                        galleryCheck.limit
                    } ${
                        galleryCheck.limit === 3 ? "galerie" : "galerii"
                    }. Przejdź na wyższy plan, aby tworzyć więcej galerii.`,
                    upgradeRequired: true,
                    currentPlan: galleryCheck.plan,
                },
                { status: 403 }
            );
        }

        // Plan FREE nie może tworzyć chronionych galerii
        const isPremium = hasPremiumAccess(galleryCheck.plan);

        if (!isPremium && is_public === false) {
            return NextResponse.json(
                {
                    message:
                        "Ochrona hasłem jest dostępna od planu Basic. Przejdź na wyższy plan.",
                    upgradeRequired: true,
                    currentPlan: galleryCheck.plan,
                },
                { status: 403 }
            );
        }

        // Dla FREE automatycznie ustaw is_public na true
        const finalIsPublic = isPremium ? is_public ?? false : true;

        // Sprawdź czy slug jest unikalny dla tego użytkownika
        const existing = await query(
            "SELECT id FROM collections WHERE user_id = $1 AND slug = $2",
            [user!.id, slug]
        );

        if (existing.rows.length > 0) {
            return createErrorResponse(
                "Kolekcja z tym adresem URL już istnieje",
                400
            );
        }

        // Hash hasła jeśli jest podane
        let passwordHash = null;
        if (password) {
            const bcrypt = require("bcrypt");
            passwordHash = await bcrypt.hash(password, 10);
        }

        const result = await query(
            `INSERT INTO collections 
            (user_id, name, slug, description, hero_image, password_hash, password_plain, is_public)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                user!.id,
                name,
                slug,
                description || null,
                hero_image || null,
                passwordHash,
                password || null,
                finalIsPublic,
            ]
        );

        return NextResponse.json({
            ok: true,
            collection: result.rows[0],
        });
    },
    { requireAuth: true }
);
