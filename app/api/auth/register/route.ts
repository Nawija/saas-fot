import { NextRequest, NextResponse } from "next/server";
import {
    genSalt,
    hashPassword,
    createUserWithEmail,
    findUserByEmail,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, password, code } = body;

    const cookieCode = req.cookies.get("verification_code")?.value;
    const cookieEmail = req.cookies.get("verification_email")?.value;

    if (!email || !password || !code) {
        return NextResponse.json({ error: "Brak danych" }, { status: 400 });
    }

    if (!cookieCode || !cookieEmail) {
        return NextResponse.json({ error: "Kod wygasł" }, { status: 400 });
    }

    if (email !== cookieEmail || code !== cookieCode) {
        return NextResponse.json(
            { error: "Nieprawidłowy kod" },
            { status: 400 }
        );
    }

    const existing = await findUserByEmail(email);
    if (existing)
        return NextResponse.json(
            { error: "Użytkownik już istnieje" },
            { status: 409 }
        );

    const salt = genSalt();
    const hash = hashPassword(password, salt);
    const user = await createUserWithEmail(email, hash, salt);

    const res = NextResponse.json({
        ok: true,
        user: { id: user.id, email: user.email },
    });

    // Usuń kod po użyciu
    res.cookies.delete("verification_code");
    res.cookies.delete("verification_email");

    return res;
}
