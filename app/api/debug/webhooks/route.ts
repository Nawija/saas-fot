import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUser } from "@/lib/auth/getUser";

/**
 * Debug endpoint - sprawdza ostatnie webhooki
 * Tylko dla zalogowanych użytkowników
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Pobierz ostatnie webhooki
        const webhooksResult = await query(`
            SELECT 
                id,
                event_name,
                created_at,
                processed,
                payload
            FROM lemon_squeezy_webhooks 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        // Pobierz dane użytkownika
        const userResult = await query(
            `SELECT 
                id,
                email,
                subscription_plan,
                subscription_status,
                storage_limit,
                lemon_squeezy_customer_id,
                lemon_squeezy_subscription_id
            FROM users 
            WHERE id = $1`,
            [user.id]
        );

        const webhooks = webhooksResult.rows.map((row) => ({
            id: row.id,
            event_name: row.event_name,
            created_at: row.created_at,
            processed: row.processed,
            variant_id: row.payload?.data?.attributes?.variant_id,
            customer_id: row.payload?.data?.attributes?.customer_id,
            user_id: row.payload?.meta?.custom_data?.user_id,
            status: row.payload?.data?.attributes?.status,
        }));

        return NextResponse.json({
            user: userResult.rows[0],
            webhooks,
            env: {
                VARIANT_BASIC: process.env.NEXT_PUBLIC_LS_VARIANT_BASIC,
                VARIANT_PRO: process.env.NEXT_PUBLIC_LS_VARIANT_PRO,
                VARIANT_UNLIMITED: process.env.NEXT_PUBLIC_LS_VARIANT_UNLIMITED,
            },
        });
    } catch (error: any) {
        console.error("Debug webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
