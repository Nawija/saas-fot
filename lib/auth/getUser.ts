import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

export async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    try {
        const secret = process.env.JWT_SECRET!;
        const payload = jwt.verify(token, secret) as any;
        const res = await query(
            `SELECT 
                id, email, avatar, name, provider,
                subscription_plan, subscription_status, 
                CAST(storage_used AS BIGINT) as storage_used,
                CAST(storage_limit AS BIGINT) as storage_limit,
                lemon_squeezy_customer_id,
                lemon_squeezy_subscription_id,
                subscription_ends_at,
                username,
                is_username_set,
                bio
            FROM users 
            WHERE id = $1`,
            [payload.sub]
        );

        const user = res.rows[0];
        if (!user) return null;

        // Konwertuj BIGINT na number (PostgreSQL zwraca jako string)
        return {
            ...user,
            storage_used: parseInt(user.storage_used) || 0,
            storage_limit: parseInt(user.storage_limit) || 2147483648,
        };
    } catch (e) {
        return null;
    }
}
