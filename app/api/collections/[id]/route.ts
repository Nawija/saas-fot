// app/api/collections/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUser } from "@/lib/auth/getUser";

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

        // Usuń kolekcję (CASCADE usunie też photos i photo_likes)
        await query("DELETE FROM collections WHERE id = $1 AND user_id = $2", [
            id,
            user.id,
        ]);

        return NextResponse.json({ success: true });
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
        const { hero_image, name, description, password, is_public } = body;

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
        if (password !== undefined) {
            const bcrypt = require("bcrypt");
            const hash = await bcrypt.hash(password, 10);
            updates.push(`password_hash = $${paramCount++}`);
            values.push(hash);
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
