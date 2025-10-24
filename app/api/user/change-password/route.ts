// /app/api/user/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt, hashPassword, genSalt, findUserByEmail } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
        return NextResponse.json({ error: "Brak tokena" }, { status: 401 });

    const decoded = verifyJwt(token);
    if (!decoded)
        return NextResponse.json(
            { error: "Nieprawidłowy token" },
            { status: 401 }
        );

    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword)
        return NextResponse.json({ error: "Brak danych" }, { status: 400 });

    const user = await findUserByEmail(decoded.email);
    if (!user)
        return NextResponse.json(
            { error: "Użytkownik nie istnieje" },
            { status: 404 }
        );

    const currentHash = hashPassword(oldPassword, user.salt);
    if (currentHash !== user.password_hash)
        return NextResponse.json(
            { error: "Błędne stare hasło" },
            { status: 403 }
        );

    const newSalt = genSalt();
    const newHash = hashPassword(newPassword, newSalt);

    await query(
        `UPDATE users SET password_hash = $1, salt = $2 WHERE email = $3`,
        [newHash, newSalt, user.email]
    );

    return NextResponse.json({ ok: true });
}
