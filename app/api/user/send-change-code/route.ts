import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getUser } from "@/lib/auth/getUser";
import { createErrorResponse } from "@/lib/utils/apiHelpers";

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();

        if (!user) {
            return createErrorResponse("Nie zalogowano", 401);
        }

        // Sprawdź czy użytkownik używa email (nie Google)
        if (user.provider !== "email") {
            return createErrorResponse(
                "Zmiana hasła dostępna tylko dla kont z emailem",
                403
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

        await transporter.sendMail({
            from: `"Twoja Aplikacja" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: "🔐 Potwierdzenie zmiany hasła",
            html: `
              <h2>Zmiana hasła</h2>
              <p>Jeśli chcesz zmienić hasło do swojego konta, wpisz poniższy kod:</p>
              <h3>${code}</h3>
              <p>Kod jest ważny przez 5 minut.</p>
              <p>Jeśli to nie Ty inicjowałeś zmianę, skontaktuj się z supportem</p>
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
        console.error("Send change code error:", err);
        return createErrorResponse("Błąd wysyłki maila", 500);
    }
}
