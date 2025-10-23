import { NextRequest, NextResponse } from "next/server";
import { createJwt, createOrUpdateGoogleUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  try {
    // 1️⃣ Wymiana code -> access_token
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

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Google token exchange error:", tokenData);
      return NextResponse.json({ error: "Failed to get Google token" }, { status: 400 });
    }

    // 2️⃣ Pobierz dane użytkownika z Google API
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();

    if (!googleUser.email) {
      return NextResponse.json({ error: "No email from Google" }, { status: 400 });
    }

    // 3️⃣ Zapisz / zaktualizuj użytkownika w DB
    const user = await createOrUpdateGoogleUser(googleUser.email, googleUser.id);

    // 4️⃣ Utwórz JWT
    const jwtToken = createJwt({ sub: user.id, email: user.email });

    // 5️⃣ Ustaw ciasteczko i przekieruj na /dashboard
    const dashboardUrl = new URL("/dashboard", req.url);
    const res = NextResponse.redirect(dashboardUrl);

    res.cookies.set("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dni
    });

    return res;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
