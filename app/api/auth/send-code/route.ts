import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    const { email } = await req.json();

    if (!email) {
        return NextResponse.json(
            { error: "Brak adresu email" },
            { status: 400 }
        );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `"Twoja Aplikacja" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "🔐 Twój kod weryfikacyjny",
            html: `
  <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 40px 0;">
    <div style="max-width: 520px; background-color: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
      <div style="background-color: #2563eb; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">Twoja Aplikacja</h1>
      </div>
      <div style="padding: 30px; text-align: center; color: #333;">
        <h2 style="margin-top: 0; color: #111;">Twój kod weryfikacyjny</h2>
        <p style="font-size: 16px; color: #555;">Użyj poniższego kodu, aby potwierdzić swoją tożsamość:</p>
        <div style="font-size: 28px; letter-spacing: 3px; font-weight: bold; margin: 20px 0; color: #2563eb;">${code}</div>
        <p style="font-size: 14px; color: #777;">Kod jest ważny przez 5 minut. Nie udostępniaj go nikomu.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #aaa;">Jeśli nie prosiłeś o ten kod, zignoruj tę wiadomość.</p>
      </div>
    </div>
    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">© ${new Date().getFullYear()} Twoja Aplikacja</p>
  </div>
  `,
        });

        // 🔐 Zapisz kod w ciasteczku (tylko backend ma dostęp)
        const res = NextResponse.json({ ok: true });
        res.cookies.set("verification_code", code, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 5 * 60, // 5 minut
        });
        res.cookies.set("verification_email", email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 5 * 60,
        });

        return res;
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Błąd wysyłki maila" },
            { status: 500 }
        );
    }
}
