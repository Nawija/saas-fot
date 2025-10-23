// /api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateGoogleUser, createJwt } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code)
        return NextResponse.json({ error: "missing code" }, { status: 400 });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri:
                process.env.GOOGLE_REDIRECT_URI ||
                `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
            grant_type: "authorization_code",
        }),
    });

    const tokenJson = await tokenRes.json();
    if (!tokenJson.access_token) {
        return NextResponse.json(
            { error: "token exchange failed", details: tokenJson },
            { status: 400 }
        );
    }

    const profileRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
            headers: { Authorization: `Bearer ${tokenJson.access_token}` },
        }
    );
    const profile = await profileRes.json();
    // profile has id, email, verified_email, name, picture

    const user = await createOrUpdateGoogleUser(profile.email, profile.id);

    const token = createJwt({ sub: user.id, email: user.email });

    const res = NextResponse.redirect("/dashboard");
    const maxAge = 60 * 60 * 24 * 7;
    res.headers.set(
        "Set-Cookie",
        `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure=${
            process.env.NODE_ENV === "production"
        }`
    );
    return res;
}
