// /app/api/auth/google/start/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri =
        process.env.GOOGLE_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
    const scope = encodeURIComponent("openid email profile");
    const state = Math.random().toString(36).substring(2);
    // You may persist state to verify in callback. For brevity we skip persist.
    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&scope=${scope}&state=${state}&access_type=offline&prompt=select_account`;
    console.log("Redirect URI sent to Google:", redirectUri);
    return NextResponse.redirect(url);
}
