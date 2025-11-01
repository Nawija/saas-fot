import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { deleteCollectionFolder } from "@/lib/r2";
import { withMiddleware } from "@/lib/utils/apiMiddleware";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import {
    getCollectionForUser,
    updateUserStorage,
    getUserPlan,
    hasPremiumAccess,
} from "@/lib/utils/userHelpers";
import {
    PREMIUM_TEMPLATES,
    ALLOWED_TEMPLATES,
} from "@/components/dashboard/hero-templates/registry";

export const GET = withMiddleware(
    async (req, { user, params }) => {
        const collection = await getCollectionForUser(params.id, user!.id);

        if (!collection) {
            return createErrorResponse("Collection not found", 404);
        }

        return NextResponse.json(collection);
    },
    { requireAuth: true, requiredParams: ["id"] }
);

export const DELETE = withMiddleware(
    async (req, { user, params }) => {
        const collection = await getCollectionForUser(params.id, user!.id);

        if (!collection) {
            return createErrorResponse("Collection not found", 404);
        }

        // Policz całkowity rozmiar zdjęć do zwolnienia
        const photosResult = await query(
            "SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as total_size FROM photos WHERE collection_id = $1",
            [params.id]
        );

        const photoCount = parseInt(photosResult.rows[0]?.count || "0");
        const totalSize = parseInt(photosResult.rows[0]?.total_size || "0");

        console.log(
            `[Delete Collection] Deleting collection ${params.id} with ${photoCount} photos (${totalSize} bytes)`
        );

        // Usuń całą kolekcję z R2
        try {
            await deleteCollectionFolder(user!.id, parseInt(params.id));
            console.log(
                `[Delete Collection] Successfully deleted all R2 files for collection ${params.id}`
            );
        } catch (error) {
            console.error(
                "[Delete Collection] Error deleting R2 files:",
                error
            );
            throw new Error(
                "Nie udało się usunąć wszystkich plików. Spróbuj ponownie."
            );
        }

        // Usuń kolekcję z bazy (CASCADE usunie też photos i photo_likes)
        const deleteResult = await query(
            "DELETE FROM collections WHERE id = $1 AND user_id = $2 RETURNING id",
            [params.id, user!.id]
        );

        if (deleteResult.rowCount === 0) {
            throw new Error("Nie udało się usunąć kolekcji z bazy danych");
        }

        // Zmniejsz storage_used
        if (totalSize > 0) {
            await updateUserStorage(user!.id, -totalSize);
        }

        console.log(
            `[Delete Collection] Successfully deleted collection ${params.id} from database`
        );

        return NextResponse.json({
            ok: true,
            message: "Collection deleted",
            deletedPhotos: photoCount,
            freedSpace: totalSize,
        });
    },
    { requireAuth: true, requiredParams: ["id"] }
);

export const PATCH = withMiddleware(
    async (req, { user, params }) => {
        const collection = await getCollectionForUser(params.id, user!.id);

        if (!collection) {
            return createErrorResponse("Collection not found", 404);
        }

        const body = await req.json();
        const {
            hero_image,
            name,
            description,
            password,
            password_plain,
            is_public,
            hero_template,
            hero_font,
        } = body;

        const { plan } = await getUserPlan(user!.id);
        const isPremium = hasPremiumAccess(plan);

        const allowedTemplates = new Set(ALLOWED_TEMPLATES);
        const premiumTemplates = new Set(PREMIUM_TEMPLATES);
        const allowedFonts = new Set(["inter", "playfair", "poppins"]);

        // Buduj dynamiczne zapytanie UPDATE
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (hero_image !== undefined) {
            updates.push(`hero_image = $${paramCount++}`);
            values.push(hero_image);
        }
        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(description);
        }
        if (is_public !== undefined) {
            if (!isPremium && is_public === false) {
                return NextResponse.json(
                    {
                        error: "Funkcja niedostępna",
                        message:
                            "Ochrona hasłem jest dostępna od planu Basic. Przejdź na wyższy plan.",
                        upgradeRequired: true,
                        currentPlan: plan,
                    },
                    { status: 403 }
                );
            }

            updates.push(`is_public = $${paramCount++}`);
            values.push(is_public);
        }
        if (hero_template !== undefined) {
            if (
                typeof hero_template !== "string" ||
                !allowedTemplates.has(hero_template)
            ) {
                return createErrorResponse("Invalid hero_template value", 400);
            }

            if (premiumTemplates.has(hero_template) && !isPremium) {
                return NextResponse.json(
                    {
                        error: "Premium szablon niedostępny",
                        message:
                            "Ten szablon jest dostępny tylko dla subskrybentów. Przejdź na plan Basic, Pro lub Unlimited.",
                        upgradeRequired: true,
                    },
                    { status: 403 }
                );
            }

            updates.push(`hero_template = $${paramCount++}`);
            values.push(hero_template);
        }
        if (hero_font !== undefined) {
            if (typeof hero_font !== "string" || !allowedFonts.has(hero_font)) {
                return createErrorResponse("Invalid hero_font value", 400);
            }
            updates.push(`hero_font = $${paramCount++}`);
            values.push(hero_font);
        }
        if (password !== undefined) {
            const bcrypt = require("bcrypt");
            const hash = await bcrypt.hash(password, 10);
            updates.push(`password_hash = $${paramCount++}`);
            values.push(hash);
        }
        if (password_plain !== undefined) {
            if (password_plain === null || password_plain === "") {
                updates.push(`password_plain = $${paramCount++}`);
                values.push(null);
                updates.push(`password_hash = $${paramCount++}`);
                values.push(null);
            } else {
                const bcrypt = require("bcrypt");
                const hash = await bcrypt.hash(password_plain, 10);
                updates.push(`password_plain = $${paramCount++}`);
                values.push(password_plain);
                updates.push(`password_hash = $${paramCount++}`);
                values.push(hash);
            }
        }

        updates.push(`updated_at = NOW()`);

        if (updates.length === 1) {
            return createErrorResponse("No fields to update", 400);
        }

        values.push(params.id, user!.id);

        const result = await query(
            `UPDATE collections 
             SET ${updates.join(", ")}
             WHERE id = $${paramCount++} AND user_id = $${paramCount}
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return createErrorResponse("Collection not found", 404);
        }

        return NextResponse.json({
            ok: true,
            collection: result.rows[0],
        });
    },
    { requireAuth: true, requiredParams: ["id"] }
);
