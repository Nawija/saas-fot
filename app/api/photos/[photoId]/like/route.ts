import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";

// Hash email to create guest identifier (never store raw email)
function hashEmail(email: string): string {
    return crypto
        .createHash("sha256")
        .update(email.toLowerCase().trim())
        .digest("hex");
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ photoId: string }> }
) {
    try {
        const { photoId: photoIdParam } = await params;
        const photoId = parseInt(photoIdParam);
        if (isNaN(photoId)) {
            return NextResponse.json(
                { error: "Invalid photo ID" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { email } = body;

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Hash email to create anonymous identifier
        const guestSessionId = hashEmail(email);

        // Check if photo exists
        const photoCheck = await query("SELECT id FROM photos WHERE id = $1", [
            photoId,
        ]);

        if (photoCheck.rows.length === 0) {
            return NextResponse.json(
                { error: "Photo not found" },
                { status: 404 }
            );
        }

        // Try to insert like; use RETURNING to detect whether we inserted a new row.
        const insertRes = await query(
            "INSERT INTO photo_likes (photo_id, guest_session_id) VALUES ($1, $2) ON CONFLICT (photo_id, guest_session_id) DO NOTHING RETURNING id",
            [photoId, guestSessionId]
        );

        if (insertRes.rows.length === 0) {
            // already liked
            return NextResponse.json(
                { error: "Already liked" },
                { status: 409 }
            );
        }

        // Increment denormalized counter and return the new value
        const upd = await query(
            "UPDATE photos SET like_count = like_count + 1 WHERE id = $1 RETURNING like_count",
            [photoId]
        );

        const likeCount = upd.rows?.[0]?.like_count ?? null;

        return NextResponse.json({
            success: true,
            liked: true,
            likeCount,
        });
    } catch (error) {
        console.error("Error adding like:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ photoId: string }> }
) {
    try {
        const { photoId: photoIdParam } = await params;
        const photoId = parseInt(photoIdParam);
        if (isNaN(photoId)) {
            return NextResponse.json(
                { error: "Invalid photo ID" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { email } = body;

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const guestSessionId = hashEmail(email);

        // Delete like and know whether a row was removed
        const result = await query(
            "DELETE FROM photo_likes WHERE photo_id = $1 AND guest_session_id = $2 RETURNING id",
            [photoId, guestSessionId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Like not found" },
                { status: 404 }
            );
        }

        // Decrement denormalized counter safely
        const upd = await query(
            "UPDATE photos SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1 RETURNING like_count",
            [photoId]
        );

        const likeCount = upd.rows?.[0]?.like_count ?? null;

        return NextResponse.json({
            success: true,
            liked: false,
            likeCount,
        });
    } catch (error) {
        console.error("Error removing like:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ photoId: string }> }
) {
    try {
        const { photoId: photoIdParam } = await params;
        const photoId = parseInt(photoIdParam);
        if (isNaN(photoId)) {
            return NextResponse.json(
                { error: "Invalid photo ID" },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        // Prefer denormalized counter if available
        const photoRes = await query(
            "SELECT like_count FROM photos WHERE id = $1",
            [photoId]
        );
        let likeCount: number | null = null;
        if (
            photoRes.rows.length > 0 &&
            typeof photoRes.rows[0].like_count !== "undefined"
        ) {
            likeCount = parseInt(photoRes.rows[0].like_count, 10) || 0;
        } else {
            // fallback to counting rows in photo_likes
            const countResult = await query(
                "SELECT COUNT(*) as count FROM photo_likes WHERE photo_id = $1",
                [photoId]
            );
            likeCount = parseInt(countResult.rows[0].count, 10) || 0;
        }

        // Check if user liked (if email provided)
        let liked = false;
        if (email) {
            const guestSessionId = hashEmail(email);
            const likeCheck = await query(
                "SELECT id FROM photo_likes WHERE photo_id = $1 AND guest_session_id = $2",
                [photoId, guestSessionId]
            );
            liked = likeCheck.rows.length > 0;
        }

        return NextResponse.json({
            likeCount,
            liked,
        });
    } catch (error) {
        console.error("Error getting likes:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
