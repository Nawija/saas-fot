import { query } from "@/lib/db";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

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

/**
 * Sprawdza storage użytkownika i wysyła alert jeśli przekroczył 70%
 * @param userId - ID użytkownika
 * @returns Promise<boolean> - true jeśli alert został wysłany
 */
export async function checkAndSendStorageAlert(
    userId: string
): Promise<boolean> {
    try {
        // Pobierz dane storage użytkownika
        const userResult = await query(
            `
      SELECT 
        id, 
        email, 
        storage_used, 
        storage_limit,
        ROUND((storage_used::numeric / NULLIF(storage_limit, 0)::numeric * 100)::numeric, 1) as storage_percent
      FROM users
      WHERE 
        id = $1
        AND storage_limit > 0 
        AND (storage_used::numeric / storage_limit::numeric) >= 0.80
        AND (storage_used::numeric / storage_limit::numeric) <= 0.81
        AND email IS NOT NULL
        AND email != ''
    `,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return false;
        }

        const user = userResult.rows[0];

        // Sprawdź czy alert został już wysłany dzisiaj (opcjonalne - można dodać tabelę z logami)
        // TODO: Dodać tabelę storage_alerts_log jeśli chcesz ograniczyć wysyłkę do 1x dziennie

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

        const emailHtml = replaceTemplateVariables(template, {
            storagePercent: user.storage_percent.toString(),
            storageUsed: formatBytes(parseInt(user.storage_used)),
            storageLimit: formatBytes(parseInt(user.storage_limit)),
            dashboardUrl,
        });

        // Wyślij email
        await transporter.sendMail({
            from: `"Your SaaS Storage Alert" <${
                process.env.SMTP_FROM || process.env.SMTP_USER
            }>`,
            to: user.email,
            subject: "⚠️ Storage Alert: Your storage is nearly full",
            html: emailHtml,
        });

        console.log(
            `✅ Storage alert sent to ${user.email} (${user.storage_percent}% full)`
        );
        return true;
    } catch (error) {
        console.error("Failed to send storage alert:", error);
        return false;
    }
}

/**
 * Sprawdza storage i zwraca informacje bez wysyłania emaila
 * @param userId - ID użytkownika
 * @returns Promise<object | null> - Informacje o storage lub null
 */
export async function checkStorageStatus(userId: string): Promise<{
    storageUsed: number;
    storageLimit: number;
    storagePercent: number;
    isOverThreshold: boolean;
} | null> {
    try {
        const userResult = await query(
            `
      SELECT 
        storage_used, 
        storage_limit,
        ROUND((storage_used::numeric / NULLIF(storage_limit, 0)::numeric * 100)::numeric, 1) as storage_percent
      FROM users
      WHERE id = $1 AND storage_limit > 0
    `,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return null;
        }

        const user = userResult.rows[0];

        return {
            storageUsed: parseInt(user.storage_used),
            storageLimit: parseInt(user.storage_limit),
            storagePercent: parseFloat(user.storage_percent),
            isOverThreshold:
                parseFloat(user.storage_percent) >= 70 &&
                parseFloat(user.storage_percent) <= 73,
        };
    } catch (error) {
        console.error("Failed to check storage status:", error);
        return null;
    }
}
