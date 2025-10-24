// /app/api/user/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { genSalt, hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    const { code, newPassword, confirmPassword } = await req.json();

    if (!code || !newPassword || !confirmPassword) {
        return NextResponse.json({ error: "Brak danych" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
        return NextResponse.json(
            { error: "Hasła nie są takie same" },
            { status: 400 }
        );
    }

    const cookieCode = req.cookies.get("change_code")?.value;
    const cookieEmail = req.cookies.get("change_email")?.value;

    if (!cookieCode || !cookieEmail) {
        return NextResponse.json({ error: "Kod wygasł" }, { status: 400 });
    }

    if (code !== cookieCode) {
        return NextResponse.json(
            { error: "Nieprawidłowy kod" },
            { status: 400 }
        );
    }

    const user = await getUser();
    if (!user || user.email !== cookieEmail) {
        return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
    }

    const salt = genSalt();
    const hash = hashPassword(newPassword, salt);

    await query(
        `UPDATE users SET password_hash = $1, salt = $2 WHERE email = $3`,
        [hash, salt, user.email]
    );

    const res = NextResponse.json({ ok: true });
    res.cookies.delete("change_code");
    res.cookies.delete("change_email");

    return res;
}
