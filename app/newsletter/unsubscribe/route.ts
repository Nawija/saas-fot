import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Przekierowanie do nowego API endpoint
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Przekieruj do nowego API endpoint
    const apiUrl = new URL("/api/newsletter/unsubscribe", request.url);
    if (token) {
        apiUrl.searchParams.set("token", token);
    }

    return NextResponse.redirect(apiUrl);
}
