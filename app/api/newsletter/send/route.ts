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

// Funkcja do konwersji Markdown/HTML do ładnego HTML
function formatContent(content: string): string {
    // Konwertuj podstawowe elementy Markdown
    let formatted = content;

    // Headers (## -> <h3>, ### -> <h4>)
    formatted = formatted.replace(
        /^### (.+)$/gm,
        '<h4 style="color: #333; font-size: 18px; font-weight: 600; margin: 20px 0 10px;">$1</h4>'
    );
    formatted = formatted.replace(
        /^## (.+)$/gm,
        '<h3 style="color: #333; font-size: 22px; font-weight: 600; margin: 25px 0 15px;">$1</h3>'
    );

    // Links [text](url) - MUSI BYĆ PRZED Bold/Italic aby nie konfliktowało z **
    formatted = formatted.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" style="color: #667eea; text-decoration: underline; font-weight: 500;">$1</a>'
    );

    // Bold (**text** -> <strong>)
    formatted = formatted.replace(
        /\*\*(.+?)\*\*/g,
        '<strong style="color: #667eea; font-weight: 600;">$1</strong>'
    );

    // Lista punktowana (- item lub • item)
    formatted = formatted.replace(
        /^[•\-]\s+(.+)$/gm,
        '<li style="margin: 8px 0; color: #333;">$1</li>'
    );

    // Owinięcie list w <ul>
    if (formatted.includes("<li")) {
        // Znajdź wszystkie ciągi <li> i owinięcie w <ul>
        const listRegex = /(<li[^>]*>.*?<\/li>\s*)+/g;
        formatted = formatted.replace(
            listRegex,
            '<ul style="margin: 15px 0; padding-left: 25px; list-style-type: disc;">$&</ul>'
        );
    }

    // Numbered list (1. item, 2. item etc)
    formatted = formatted.replace(
        /^\d+\.\s+(.+)$/gm,
        '<li style="margin: 8px 0; color: #333;">$1</li>'
    );

    // Emoji spacing (dodaj odstęp po emoji)
    formatted = formatted.replace(
        /([\u{1F300}-\u{1F9FF}])/gu,
        '<span style="margin-right: 6px;">$1</span>'
    );

    // Paragrafy (podwójny newline -> <p>)
    const paragraphs = formatted.split("\n\n");
    formatted = paragraphs
        .map((p) => {
            p = p.trim();
            if (
                p.startsWith("<h") ||
                p.startsWith("<ul") ||
                p.startsWith("<ol")
            ) {
                return p;
            }
            if (p.length > 0) {
                return `<p style="margin: 15px 0; color: #333; line-height: 1.8;">${p}</p>`;
            }
            return "";
        })
        .filter((p) => p.length > 0)
        .join("\n");

    // Single newlines wewnątrz paragrafów -> <br>
    formatted = formatted.replace(/(?<!>)\n(?!<)/g, "<br>");

    return formatted;
}

// Funkcja do zastąpienia zmiennych w szablonie
function replaceTemplateVariables(
    template: string,
    variables: Record<string, string>
): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        // Dla {{{content}}} (triple braces) nie escapuj HTML
        result = result.replace(new RegExp(`{{{${key}}}}`, "g"), value);
        // Dla {{key}} (double braces) normalnie
        result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
    return result;
}

export async function POST(request: NextRequest) {
    try {
        // Sprawdzenie autoryzacji (opcjonalne - dodaj swój mechanizm)
        const authHeader = request.headers.get("authorization");
        const expectedToken = process.env.CRON_SECRET;

        // DEBUGOWANIE: Loguj info o autoryzacji
        console.log("[NEWSLETTER] Auth check:", {
            hasAuthHeader: !!authHeader,
            hasExpectedToken: !!expectedToken,
        });

        if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
            console.log("[NEWSLETTER] Authorization failed");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Pobierz najnowszy newsletter z bazy
        const newsletterResult = await query(
            "SELECT id, title, content FROM newsletter_messages ORDER BY created_at DESC LIMIT 1"
        );

        console.log(
            "[NEWSLETTER] Newsletter found:",
            newsletterResult.rows.length
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
        console.log("[NEWSLETTER] Newsletter title:", newsletter.title);

        // Pobierz wszystkich aktywnych subskrybentów
        const subscribersResult = await query(
            "SELECT email, unsubscribe_token FROM newsletter_subscribers WHERE is_active = true"
        );

        console.log("[NEWSLETTER] Active subscribers:", {
            count: subscribersResult.rows.length,
            emails: subscribersResult.rows.map((s) => s.email),
        });

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
            process.env.NEXT_PUBLIC_APP_URL || "https://seovileo.pl";

        let successCount = 0;
        let failureCount = 0;
        const errors: string[] = [];

        // Wyślij newsletter do każdego subskrybenta
        for (const subscriber of subscribersResult.rows) {
            try {
                const unsubscribeUrl = `${websiteUrl}/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`;

                // Sformatuj content z Markdown do HTML
                const formattedContent = formatContent(newsletter.content);

                const emailHtml = replaceTemplateVariables(template, {
                    title: newsletter.title,
                    content: formattedContent,
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
