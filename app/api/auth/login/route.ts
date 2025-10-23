// /app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, hashPassword, createJwt } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
        return NextResponse.json(
            { error: "email and password required" },
            { status: 400 }
        );
    }

    const user = await findUserByEmail(email);
    if (!user || !user.password_hash || !user.salt) {
        return NextResponse.json(
            { error: "invalid credentials" },
            { status: 401 }
        );
    }

    const attemptHash = hashPassword(password, user.salt);
    if (attemptHash !== user.password_hash) {
        return NextResponse.json(
            { error: "invalid credentials" },
            { status: 401 }
        );
    }

    const token = createJwt({ sub: user.id, email: user.email });

    const res = NextResponse.json({
        ok: true,
        user: { id: user.id, email: user.email },
    });
    const maxAge = 60 * 60 * 24 * 7;
    res.headers.set(
        "Set-Cookie",
        `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure=${
            process.env.NODE_ENV === "production"
        }`
    );
    return res;
}
