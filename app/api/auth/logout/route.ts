// /app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const res = NextResponse.json({ ok: true });
    res.headers.set(
        "Set-Cookie",
        `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure=${
            process.env.NODE_ENV === "production"
        }`
    );
    return res;
}
