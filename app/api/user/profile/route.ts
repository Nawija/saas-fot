import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

export async function PATCH(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { ok: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const secret = process.env.JWT_SECRET!;
        const payload = jwt.verify(token, secret) as any;
        const userId = payload.sub;

        const body = await req.json();
        const { name, bio } = body;

        // Validate input
        if (name && name.length > 100) {
            return NextResponse.json(
                { ok: false, error: "Name too long (max 100 characters)" },
                { status: 400 }
            );
        }

        if (bio && bio.length > 500) {
            return NextResponse.json(
                { ok: false, error: "Bio too long (max 500 characters)" },
                { status: 400 }
            );
        }

        // Update user profile
        await query(
            `UPDATE users 
             SET name = COALESCE($1, name), 
                 bio = COALESCE($2, bio)
             WHERE id = $3`,
            [name || null, bio || null, userId]
        );

        return NextResponse.json({
            ok: true,
            message: "Profile updated successfully",
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { ok: false, error: "Server error" },
            { status: 500 }
        );
    }
}
