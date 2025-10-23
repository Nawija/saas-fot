// /app/api/auth/send-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const verificationCodes = new Map<string, string>(); // email → code

export async function POST(req: NextRequest) {
    const { email } = await req.json();

    if (!email) {
        return NextResponse.json(
            { error: "Brak adresu email" },
            { status: 400 }
        );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(email, code);

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
            text: `Twój kod weryfikacyjny to: ${code}`,
            html: `<p>Twój kod weryfikacyjny to: <b>${code}</b></p>`,
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Błąd wysyłki maila:", err);
        return NextResponse.json(
            { error: "Nie udało się wysłać maila" },
            { status: 500 }
        );
    }
}

export function verifyCode(email: string, code: string): boolean {
    const saved = verificationCodes.get(email);
    if (saved && saved === code) {
        verificationCodes.delete(email);
        return true;
    }
    return false;
}
