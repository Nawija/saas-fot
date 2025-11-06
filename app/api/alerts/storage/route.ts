import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

// Funkcja do formatowania rozmiaru
function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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

        // Pobierz użytkowników z zajętością ≥70% storage
        const usersResult = await query(`
      SELECT 
        id, 
        email, 
        storage_used, 
        storage_limit,
        ROUND((storage_used::numeric / NULLIF(storage_limit, 0)::numeric * 100)::numeric, 1) as storage_percent
      FROM users
      WHERE 
        storage_limit > 0 
        AND (storage_used::numeric / storage_limit::numeric) >= 0.7
        AND email IS NOT NULL
        AND email != ''
    `);

        if (usersResult.rows.length === 0) {
            return NextResponse.json({
                message: "No users found with storage usage ≥70%",
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

        // Załaduj szablon alertu
        const template = loadTemplate("storageAlert.html");

        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
            : "https://yourwebsite.com/dashboard";

        let successCount = 0;
        let failureCount = 0;
        const errors: string[] = [];

        // Wyślij alert do każdego użytkownika
        for (const user of usersResult.rows) {
            try {
                const emailHtml = replaceTemplateVariables(template, {
                    storagePercent: user.storage_percent.toString(),
                    storageUsed: formatBytes(parseInt(user.storage_used)),
                    storageLimit: formatBytes(parseInt(user.storage_limit)),
                    dashboardUrl,
                });

                await transporter.sendMail({
                    from: `"Your SaaS Storage Alert" <${
                        process.env.SMTP_FROM || process.env.SMTP_USER
                    }>`,
                    to: user.email,
                    subject: "⚠️ Storage Alert: Your storage is nearly full",
                    html: emailHtml,
                });

                successCount++;
            } catch (error) {
                failureCount++;
                errors.push(`Failed to send to ${user.email}: ${error}`);
                console.error(
                    `Failed to send storage alert to ${user.email}:`,
                    error
                );
            }
        }

        return NextResponse.json({
            message: "Storage alerts sending completed",
            sent: successCount,
            failed: failureCount,
            total: usersResult.rows.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Storage alert error:", error);
        return NextResponse.json(
            { error: "Failed to send storage alerts" },
            { status: 500 }
        );
    }
}
