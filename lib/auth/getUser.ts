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
            "SELECT id, email, avatar, name, provider FROM users WHERE id = $1",
            [payload.sub]
        );
        return res.rows[0] ?? null;
    } catch (e) {
        return null;
    }
}
