// /app/api/user/me/route.ts
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";

export async function GET() {
    const user = await getUser();
    if (!user)
        return NextResponse.json(
            { ok: false, error: "Nie zalogowano" },
            { status: 401 }
        );
    return NextResponse.json({ ok: true, user });
}
