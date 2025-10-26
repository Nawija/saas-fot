import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { query } from "@/lib/db";
import { deleteUserFolder } from "@/lib/r2";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = user.id;
        console.log(`[Delete Account] Starting deletion for user: ${userId}`);

        // 1. Anuluj subskrypcję w Lemon Squeezy (jeśli istnieje)
        if (user.lemon_squeezy_subscription_id) {
            try {
                console.log(
                    `[Delete Account] Cancelling subscription: ${user.lemon_squeezy_subscription_id}`
                );

                const cancelRes = await fetch(
                    `https://api.lemonsqueezy.com/v1/subscriptions/${user.lemon_squeezy_subscription_id}`,
                    {
                        method: "DELETE",
                        headers: {
                            Accept: "application/vnd.api+json",
                            Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
                        },
                    }
                );

                if (!cancelRes.ok) {
                    console.error(
                        `[Delete Account] Failed to cancel subscription: ${await cancelRes.text()}`
                    );
                    // Nie przerywamy procesu - kontynuujemy usuwanie konta
                }
            } catch (error) {
                console.error(
                    "[Delete Account] Error cancelling subscription:",
                    error
                );
                // Nie przerywamy procesu
            }
        }

        // 2. Usuń wszystkie pliki użytkownika z R2 (zdjęcia, kolekcje, avatar)
        try {
            console.log(
                `[Delete Account] Deleting R2 files for user: ${userId}`
            );
            await deleteUserFolder(userId);
        } catch (error) {
            console.error("[Delete Account] Error deleting R2 files:", error);
            // Kontynuujemy mimo błędu
        }

        // 3. Usuń wszystkie dane z bazy danych (CASCADE usunie powiązane rekordy)
        console.log(
            `[Delete Account] Deleting database records for user: ${userId}`
        );

        // Usuń zdjęcia (CASCADE powinien to obsłużyć, ale dla pewności)
        await query(
            `DELETE FROM photos WHERE collection_id IN (SELECT id FROM collections WHERE user_id = $1)`,
            [userId]
        );

        // Usuń kolekcje
        await query(`DELETE FROM collections WHERE user_id = $1`, [userId]);

        // Usuń użytkownika (wszystko inne powinno się usunąć przez CASCADE)
        await query(`DELETE FROM users WHERE id = $1`, [userId]);

        console.log(`[Delete Account] Successfully deleted account: ${userId}`);

        // 4. Wyloguj użytkownika (usuń token)
        const cookieStore = await cookies();
        cookieStore.delete("token");

        return NextResponse.json({
            success: true,
            message: "Konto zostało całkowicie usunięte",
        });
    } catch (error: any) {
        console.error("[Delete Account] Error:", error);
        return NextResponse.json(
            { error: "Nie udało się usunąć konta", details: error.message },
            { status: 500 }
        );
    }
}
