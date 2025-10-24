// /app/api/user/send-change-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getUser } from "@/lib/auth/getUser";

export async function POST(req: NextRequest) {
    const user = await getUser();

    if (!user) {
        return NextResponse.json({ error: "Nie zalogowano" }, { status: 401 });
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
            to: user.email,
            subject: "🔐 Potwierdzenie zmiany hasła",
            html: `
              <h2>Zmiana hasła</h2>
              <p>Jeśli chcesz zmienić hasło do swojego konta, wpisz poniższy kod:</p>
              <h3>${code}</h3>
              <p>Kod jest ważny przez 5 minut.</p>
              <p>Jeśli to nie Ty inicjowałeś zmianę, skontaktuj sie z suportem</p>
            `,
        });

        const res = NextResponse.json({ ok: true });
        res.cookies.set("change_code", code, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 5 * 60, // 5 minut
        });
        res.cookies.set("change_email", user.email, {
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
