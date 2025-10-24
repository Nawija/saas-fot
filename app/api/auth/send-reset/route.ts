// /app/api/auth/send-reset/route.ts
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
            subject: "🔐 Reset hasła — kod weryfikacyjny",
            html: `
              <h2>Reset hasła</h2>
              <p>Twój kod resetu hasła to:</p>
              <h3>${code}</h3>
              <p>Kod ważny przez 10 minut.</p>
            `,
        });

        const res = NextResponse.json({ ok: true });
        res.cookies.set("reset_code", code, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 10 * 60, // 10 minut
        });
        res.cookies.set("reset_email", email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 10 * 60,
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
