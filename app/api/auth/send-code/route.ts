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
            subject: "Twój kod weryfikacyjny",
            html: `<p>Twój kod weryfikacyjny to: <b>${code}</b></p>`,
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
