// app/api/user/update-storage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { size } = await req.json();

        if (typeof size !== "number" || size < 0) {
            return NextResponse.json(
                { error: "Invalid size" },
                { status: 400 }
            );
        }

        // Zaktualizuj storage_used
        await query(
            "UPDATE users SET storage_used = storage_used + $1 WHERE id = $2",
            [size, user.id]
        );

        return NextResponse.json({
            ok: true,
            message: "Storage updated",
        });
    } catch (error) {
        console.error("Update storage error:", error);
        return NextResponse.json(
            { error: "Failed to update storage" },
            { status: 500 }
        );
    }
}
