import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/utils/apiHelpers";

export async function POST(req: NextRequest) {
    try {
        const { email, title, steps, expected, actual } = await req.json();

        // Validation
        if (!email || !title || !steps || !expected || !actual) {
            return createErrorResponse("Wszystkie pola są wymagane", 400);
        }

        if (!email.includes("@")) {
            return createErrorResponse("Nieprawidłowy adres email", 400);
        }

        if (title.length < 5) {
            return createErrorResponse("Tytuł musi mieć minimum 5 znaków", 400);
        }

        // Get metadata
        const userAgent = req.headers.get("user-agent") || null;
        const referer = req.headers.get("referer") || null;
        const ip =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            null;

        // Save to database
        const { query } = await import("@/lib/db");
        await query(
            `INSERT INTO support_tickets 
             (email, title, steps, expected, actual, type, user_agent, referer, ip_address, created_at)
             VALUES ($1, $2, $3, $4, $5, 'bug', $6, $7, $8, NOW())`,
            [email, title, steps, expected, actual, userAgent, referer, ip]
        );

        // Log to console for monitoring
        console.log("🐛 Bug Report Submission:");
        console.log("Email:", email);
        console.log("Title:", title);
        console.log("Time:", new Date().toISOString());
        console.log("---");

        // TODO: Integrate with bug tracking system (Linear, Jira, etc.)
        // or send email notification to dev team

        return NextResponse.json({
            ok: true,
            message: "Zgłoszenie błędu zostało wysłane",
        });
    } catch (error: any) {
        console.error("Bug report error:", error);
        return createErrorResponse("Błąd wysyłania zgłoszenia", 500);
    }
}
