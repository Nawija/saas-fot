import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUser } from "@/lib/auth/getUser";
import { deleteMultipleFromR2 } from "@/lib/r2";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await query(
            `SELECT c.*, 
        (SELECT COUNT(*) FROM photos WHERE collection_id = c.id) as photo_count
       FROM collections c 
       WHERE c.id = $1 AND c.user_id = $2`,
            [id, user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Get collection error:", error);
        return NextResponse.json(
            { error: "Failed to fetch collection" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Pobierz hero image i wszystkie zdjęcia do usunięcia z R2
        const collectionResult = await query(
            "SELECT hero_image FROM collections WHERE id = $1 AND user_id = $2",
            [id, user.id]
        );

        if (collectionResult.rows.length === 0) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            );
        }

        const photosResult = await query(
            "SELECT file_path, file_size FROM photos WHERE collection_id = $1",
            [id]
        );

        // Zbierz wszystkie URL-e do usunięcia
        const urlsToDelete: string[] = [];
        const collection = collectionResult.rows[0];

        if (collection.hero_image) {
            urlsToDelete.push(collection.hero_image);
        }

        let totalSize = 0;
        photosResult.rows.forEach((photo: any) => {
            urlsToDelete.push(photo.file_path);
            totalSize += parseInt(photo.file_size) || 0;
        });

        // Usuń pliki z R2
        if (urlsToDelete.length > 0) {
            await deleteMultipleFromR2(urlsToDelete);
        }

        // Usuń kolekcję z bazy (CASCADE usunie też photos i photo_likes)
        await query("DELETE FROM collections WHERE id = $1 AND user_id = $2", [
            id,
            user.id,
        ]);

        // Zmniejsz storage_used
        if (totalSize > 0) {
            await query(
                "UPDATE users SET storage_used = storage_used - $1 WHERE id = $2",
                [totalSize, user.id]
            );
        }

        return NextResponse.json({
            ok: true,
            message: "Collection deleted",
            deletedFiles: urlsToDelete.length,
            freedSpace: totalSize,
        });
    } catch (error) {
        console.error("Delete collection error:", error);
        return NextResponse.json(
            { error: "Failed to delete collection" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
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

        const allowedTemplates = new Set([
            "minimal",
            "fullscreen",
            "split",
            "overlay",
            "gradient",
            "cards",
            "cinematic",
            "editorial",
        ]);

        const premiumTemplates = new Set([
            "split",
            "overlay",
            "cards",
            "cinematic",
            "editorial",
        ]);

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
            updates.push(`is_public = $${paramCount++}`);
            values.push(is_public);
        }
        if (hero_template !== undefined) {
            // Opcjonalna walidacja dozwolonych wartości
            if (
                typeof hero_template !== "string" ||
                !allowedTemplates.has(hero_template)
            ) {
                return NextResponse.json(
                    { error: "Invalid hero_template value" },
                    { status: 400 }
                );
            }

            // Sprawdź czy szablon jest premium i czy użytkownik ma odpowiedni plan
            if (premiumTemplates.has(hero_template)) {
                const userResult = await query(
                    "SELECT subscription_plan FROM users WHERE id = $1",
                    [user.id]
                );
                const userPlan =
                    userResult.rows[0]?.subscription_plan || "free";

                if (userPlan === "free") {
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
            }

            updates.push(`hero_template = $${paramCount++}`);
            values.push(hero_template);
        }
        if (hero_font !== undefined) {
            if (typeof hero_font !== "string" || !allowedFonts.has(hero_font)) {
                return NextResponse.json(
                    { error: "Invalid hero_font value" },
                    { status: 400 }
                );
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
            // Gdy ustawiamy password_plain, również zhashuj i zapisz w password_hash
            if (password_plain === null || password_plain === "") {
                // Jeśli usuwamy hasło (publiczna galeria)
                updates.push(`password_plain = $${paramCount++}`);
                values.push(null);
                updates.push(`password_hash = $${paramCount++}`);
                values.push(null);
            } else {
                // Zapisz zwykłe hasło i zhashowaną wersję
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
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            );
        }

        values.push(id, user.id);

        const result = await query(
            `UPDATE collections 
             SET ${updates.join(", ")}
             WHERE id = $${paramCount++} AND user_id = $${paramCount}
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ok: true,
            collection: result.rows[0],
        });
    } catch (error) {
        console.error("Update collection error:", error);
        return NextResponse.json(
            { error: "Failed to update collection" },
            { status: 500 }
        );
    }
}
