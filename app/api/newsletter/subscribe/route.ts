import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

        // Sprawdź czy email już istnieje
        const existingSubscriber = await query(
            "SELECT id, is_active FROM newsletter_subscribers WHERE email = $1",
            [email.toLowerCase().trim()]
        );

        if (existingSubscriber.rows.length > 0) {
            const subscriber = existingSubscriber.rows[0];

            // Jeśli był wypisany, ponownie aktywuj
            if (!subscriber.is_active) {
                await query(
                    "UPDATE newsletter_subscribers SET is_active = true, subscribed_at = now() WHERE email = $1",
                    [email.toLowerCase().trim()]
                );

                return NextResponse.json({
                    message:
                        "Welcome back! Your subscription has been reactivated.",
                });
            }

            return NextResponse.json(
                { error: "This email is already subscribed" },
                { status: 409 }
            );
        }

        // Dodaj nowego subskrybenta
        await query("INSERT INTO newsletter_subscribers (email) VALUES ($1)", [
            email.toLowerCase().trim(),
        ]);

        return NextResponse.json({
            message: "Successfully subscribed to newsletter!",
        });
    } catch (error) {
        console.error("Newsletter subscription error:", error);
        return NextResponse.json(
            { error: "Failed to subscribe. Please try again later." },
            { status: 500 }
        );
    }
}
