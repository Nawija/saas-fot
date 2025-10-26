import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
const bcrypt = require("bcrypt");

export async function POST(req: NextRequest) {
    try {
        const { email, code, newPassword } = await req.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { error: "Wszystkie pola są wymagane" },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: "Hasło musi mieć minimum 8 znaków" },
                { status: 400 }
            );
        }

        // Znajdź użytkownika
        const user = await query("SELECT id FROM users WHERE email = $1", [
            email,
        ]);

        if (user.rows.length === 0) {
            return NextResponse.json(
                { error: "Nieprawidłowy email" },
                { status: 400 }
            );
        }

        const userId = user.rows[0].id;

        // Sprawdź kod resetowania
        const resetCode = await query(
            `SELECT * FROM password_reset_codes 
             WHERE user_id = $1 AND code = $2 AND used = false AND expires_at > NOW()`,
            [userId, code]
        );

        if (resetCode.rows.length === 0) {
            return NextResponse.json(
                { error: "Nieprawidłowy lub wygasły kod" },
                { status: 400 }
            );
        }

        // Zahaszuj nowe hasło
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Zaktualizuj hasło
        await query("UPDATE users SET password = $1 WHERE id = $2", [
            hashedPassword,
            userId,
        ]);

        // Oznacz kod jako użyty
        await query(
            "UPDATE password_reset_codes SET used = true WHERE user_id = $1",
            [userId]
        );

        return NextResponse.json({
            ok: true,
            message: "Hasło zostało zresetowane",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}
