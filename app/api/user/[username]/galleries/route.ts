import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await context.params;

        if (!username) {
            return NextResponse.json(
                { ok: false, error: "Username is required" },
                { status: 400 }
            );
        }

        // Find user by username
        const userRes = await query(
            `SELECT id, email, name, avatar, username
             FROM users 
             WHERE username = $1`,
            [username]
        );

        if (userRes.rows.length === 0) {
            return NextResponse.json(
                { ok: false, error: "User not found" },
                { status: 404 }
            );
        }

        const user = userRes.rows[0];

        // Get user's public galleries
        const collectionsRes = await query(
            `SELECT 
                c.id, 
                c.name, 
                c.slug, 
                c.description, 
                c.hero_image,
                c.is_public,
                CASE WHEN c.password_hash IS NOT NULL THEN true ELSE false END as has_password,
                c.created_at,
                COUNT(p.id) as photo_count
            FROM collections c
            LEFT JOIN photos p ON p.collection_id = c.id
            WHERE c.user_id = $1 AND c.is_public = true
            GROUP BY c.id
            ORDER BY c.created_at DESC`,
            [user.id]
        );

        return NextResponse.json({
            ok: true,
            user: {
                username: user.username,
                name: user.name,
                avatar: user.avatar,
            },
            collections: collectionsRes.rows.map((row) => ({
                ...row,
                photo_count: parseInt(row.photo_count) || 0,
            })),
        });
    } catch (error) {
        console.error("Error fetching user galleries:", error);
        return NextResponse.json(
            { ok: false, error: "Server error" },
            { status: 500 }
        );
    }
}
