// app/api/user/update-storage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { query } from "@/lib/db";
import { canUploadFile } from "@/lib/storage";
import { checkAndSendStorageAlert } from "@/lib/services/storageAlerts";

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

        // Sprawdź czy użytkownik ma wystarczająco miejsca
        const hasSpace = await canUploadFile(user.id, size);
        if (!hasSpace) {
            return NextResponse.json(
                {
                    error: "Brak miejsca",
                    message: "Przekroczono limit storage. Zakup większy plan.",
                    upgradeRequired: true,
                },
                { status: 413 }
            );
        }

        // Zaktualizuj storage_used
        await query(
            "UPDATE users SET storage_used = storage_used + $1 WHERE id = $2",
            [size, user.id]
        );

        // Sprawdź i wyślij alert jeśli przekroczono 70% storage
        // Wywołanie asynchroniczne - nie blokuje response
        checkAndSendStorageAlert(user.id).catch((error) =>
            console.error("Storage alert error:", error)
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
