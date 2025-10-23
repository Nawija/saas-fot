// /app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
    genSalt,
    hashPassword,
    createUserWithEmail,
    findUserByEmail,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
        return NextResponse.json(
            { error: "email and password required" },
            { status: 400 }
        );
    }

    const existing = await findUserByEmail(email);
    if (existing)
        return NextResponse.json({ error: "user exists" }, { status: 409 });

    const salt = genSalt();
    const hash = hashPassword(password, salt);

    const user = await createUserWithEmail(email, hash, salt);

    // const token = createJwt({ sub: user.id, email: user.email });

    const res = NextResponse.json({
        ok: true,
        user: { id: user.id, email: user.email },
    });
    // // Set cookie
    // const maxAge = 60 * 60 * 24 * 7;
    // res.headers.set(
    //     "Set-Cookie",
    //     `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure=${
    //         process.env.NODE_ENV === "production"
    //     }`
    // );
    return res;
}
