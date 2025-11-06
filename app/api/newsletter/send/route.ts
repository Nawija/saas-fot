import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET endpoint for testing - sends newsletter when accessed in browser
export async function GET(request: NextRequest) {
    // Redirect to POST handler for testing purposes
    return POST(request);
}

// Funkcja do załadowania szablonu HTML
function loadTemplate(templateName: string): string {
    const templatePath = path.join(
        process.cwd(),
        "lib",
        "templates",
        templateName
    );
    return fs.readFileSync(templatePath, "utf-8");
}

// Funkcja do zastąpienia zmiennych w szablonie
function replaceTemplateVariables(
    template: string,
    variables: Record<string, string>
): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
    return result;
}

export async function POST(request: NextRequest) {
    try {
        // Sprawdzenie autoryzacji (opcjonalne - dodaj swój mechanizm)
        const authHeader = request.headers.get("authorization");
        const expectedToken = process.env.CRON_SECRET;

        if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Pobierz najnowszy newsletter z bazy
        const newsletterResult = await query(
            "SELECT id, title, content FROM newsletter_messages ORDER BY created_at DESC LIMIT 1"
        );

        if (newsletterResult.rows.length === 0) {
            return NextResponse.json(
                {
                    error: "No newsletter found. Please create one in admin panel.",
                },
                { status: 404 }
            );
        }

        const newsletter = newsletterResult.rows[0];

        // Pobierz wszystkich aktywnych subskrybentów
        const subscribersResult = await query(
            "SELECT email, unsubscribe_token FROM newsletter_subscribers WHERE is_active = true"
        );

        if (subscribersResult.rows.length === 0) {
            return NextResponse.json({
                message: "No active subscribers found.",
                sent: 0,
            });
        }

        // Konfiguracja nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Załaduj szablon newslettera
        const template = loadTemplate("newsletter.html");

        const websiteUrl =
            process.env.NEXT_PUBLIC_APP_URL || "https://yourwebsite.com";

        let successCount = 0;
        let failureCount = 0;
        const errors: string[] = [];

        // Wyślij newsletter do każdego subskrybenta
        for (const subscriber of subscribersResult.rows) {
            try {
                const unsubscribeUrl = `${websiteUrl}/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`;

                const emailHtml = replaceTemplateVariables(template, {
                    title: newsletter.title,
                    content: newsletter.content,
                    websiteUrl,
                    unsubscribeUrl,
                });

                await transporter.sendMail({
                    from: `"Seovileo" <${
                        process.env.SMTP_FROM || process.env.SMTP_USER
                    }>`,
                    to: subscriber.email,
                    subject: newsletter.title,
                    html: emailHtml,
                });

                successCount++;
            } catch (error) {
                failureCount++;
                errors.push(`Failed to send to ${subscriber.email}: ${error}`);
                console.error(
                    `Failed to send newsletter to ${subscriber.email}:`,
                    error
                );
            }
        }

        return NextResponse.json({
            message: "Newsletter sending completed",
            sent: successCount,
            failed: failureCount,
            total: subscribersResult.rows.length,
            newsletterTitle: newsletter.title,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Newsletter send error:", error);
        return NextResponse.json(
            { error: "Failed to send newsletter" },
            { status: 500 }
        );
    }
}
