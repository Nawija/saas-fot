// /app/api/auth/send-reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { query } from "@/lib/db";
import { randomInt } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Brak adresu email" },
                { status: 400 }
            );
        }

        // Sprawdź czy użytkownik istnieje
        const user = await query(
            "SELECT id, email, provider FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            // Nie ujawniaj czy email istnieje w systemie (security best practice)
            return NextResponse.json({
                ok: true,
                message: "Jeśli konto istnieje, kod został wysłany",
            });
        }

        // Sprawdź czy to nie konto Google
        if (user.rows[0].provider === "google") {
            return NextResponse.json(
                {
                    error: "To konto używa logowania przez Google. Nie możesz zresetować hasła.",
                },
                { status: 400 }
            );
        }

        const code = randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minut

        // Zapisz kod w bazie
        await query(
            `INSERT INTO password_reset_codes (user_id, code, expires_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id)
             DO UPDATE SET code = $2, expires_at = $3, used = false, created_at = NOW()`,
            [user.rows[0].id, code, expiresAt]
        );

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"SEOVILEO" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "🔐 Resetowanie hasła - SEOVILEO",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f7fa; padding: 40px 0;">
                    <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
                        <div style="background-color: #2563eb; color: #ffffff; padding: 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 20px;">SEOVILEO</h1>
                        </div>
                        <div style="padding: 30px; text-align: center; color: #333;">
                            <h2 style="margin-top: 0; color: #111;">Resetowanie hasła</h2>
                            <p style="font-size: 16px; color: #555;">Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.</p>
                            <p style="font-size: 16px; color: #555;">Twój kod weryfikacyjny to:</p>
                            <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 20px 0; color: #2563eb; background: #f3f4f6; padding: 20px; border-radius: 8px;">
                                ${code}
                            </div>
                            <p style="font-size: 14px; color: #777;">Kod jest ważny przez 10 minut.</p>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                            <p style="font-size: 12px; color: #aaa;">Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.</p>
                        </div>
                    </div>
                    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">© ${new Date().getFullYear()} SEOVILEO</p>
                </div>
            `,
        });

        return NextResponse.json({
            ok: true,
            message: "Kod został wysłany na email",
        });
    } catch (error) {
        console.error("Send reset error:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}
