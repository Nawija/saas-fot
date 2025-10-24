// /app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, genSalt, hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    const { email, code, newPassword } = await req.json();

    const cookieCode = req.cookies.get("reset_code")?.value;
    const cookieEmail = req.cookies.get("reset_email")?.value;

    if (!email || !code || !newPassword)
        return NextResponse.json({ error: "Brak danych" }, { status: 400 });

    if (!cookieCode || !cookieEmail)
        return NextResponse.json({ error: "Kod wygasł" }, { status: 400 });

    if (email !== cookieEmail || code !== cookieCode)
        return NextResponse.json(
            { error: "Nieprawidłowy kod" },
            { status: 400 }
        );

    const user = await findUserByEmail(email);
    if (!user)
        return NextResponse.json(
            { error: "Użytkownik nie istnieje" },
            { status: 404 }
        );

    const salt = genSalt();
    const hash = hashPassword(newPassword, salt);

    await query(
        `UPDATE users SET password_hash = $1, salt = $2 WHERE email = $3`,
        [hash, salt, email]
    );

    const res = NextResponse.json({ ok: true });
    res.cookies.delete("reset_code");
    res.cookies.delete("reset_email");
    return res;
}
