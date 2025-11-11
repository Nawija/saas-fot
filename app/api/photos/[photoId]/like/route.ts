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
        const guestIdentifier = hashEmail(email);

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

        // Try to insert like (will fail if already exists due to unique constraint)
        try {
            await query(
                "INSERT INTO photo_likes (photo_id, guest_identifier) VALUES ($1, $2)",
                [photoId, guestIdentifier]
            );

            // Get updated like count
            const countResult = await query(
                "SELECT COUNT(*) as count FROM photo_likes WHERE photo_id = $1",
                [photoId]
            );

            const likeCount = parseInt(countResult.rows[0].count);

            return NextResponse.json({
                success: true,
                liked: true,
                likeCount,
            });
        } catch (err: any) {
            // If unique constraint violation, user already liked this photo
            if (err.code === "23505") {
                return NextResponse.json(
                    { error: "Already liked" },
                    { status: 409 }
                );
            }
            throw err;
        }
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

        const guestIdentifier = hashEmail(email);

        // Delete like
        const result = await query(
            "DELETE FROM photo_likes WHERE photo_id = $1 AND guest_identifier = $2",
            [photoId, guestIdentifier]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: "Like not found" },
                { status: 404 }
            );
        }

        // Get updated like count
        const countResult = await query(
            "SELECT COUNT(*) as count FROM photo_likes WHERE photo_id = $1",
            [photoId]
        );

        const likeCount = parseInt(countResult.rows[0].count);

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

        // Get like count
        const countResult = await query(
            "SELECT COUNT(*) as count FROM photo_likes WHERE photo_id = $1",
            [photoId]
        );

        const likeCount = parseInt(countResult.rows[0].count);

        // Check if user liked (if email provided)
        let liked = false;
        if (email) {
            const guestIdentifier = hashEmail(email);
            const likeCheck = await query(
                "SELECT id FROM photo_likes WHERE photo_id = $1 AND guest_identifier = $2",
                [photoId, guestIdentifier]
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
