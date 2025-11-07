import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Unsubscribe przez token (dla linków w emailach)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(
                new URL("/newsletter?error=invalid-token", request.url)
            );
        }

        // Znajdź subskrybenta po tokenie i dezaktywuj
        const result = await query(
            "UPDATE newsletter_subscribers SET is_active = false WHERE unsubscribe_token = $1 AND is_active = true RETURNING email",
            [token]
        );

        if (result.rows.length === 0) {
            return NextResponse.redirect(
                new URL("/newsletter?error=not-found", request.url)
            );
        }

        return NextResponse.redirect(
            new URL("/newsletter?unsubscribed=true", request.url)
        );
    } catch (error) {
        console.error("Unsubscribe error:", error);
        return NextResponse.redirect(
            new URL("/newsletter?error=server-error", request.url)
        );
    }
}

// Unsubscribe przez email (dla klientów)
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Walidacja email
        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Wypisz subskrybenta
        const result = await query(
            "UPDATE newsletter_subscribers SET is_active = false WHERE email = $1 AND is_active = true RETURNING email",
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Email not found or already unsubscribed" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Successfully unsubscribed from newsletter",
        });
    } catch (error) {
        console.error("Newsletter unsubscribe error:", error);
        return NextResponse.json(
            { error: "Failed to unsubscribe. Please try again later." },
            { status: 500 }
        );
    }
}
