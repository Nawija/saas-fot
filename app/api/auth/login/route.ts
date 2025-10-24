import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, hashPassword, createJwt } from "@/lib/auth";
import { createErrorResponse } from "@/lib/utils/apiHelpers";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // Walidacja danych wejściowych
        if (!email || !password) {
            return createErrorResponse("Email i hasło są wymagane", 400);
        }

        // Sprawdzenie użytkownika
        const user = await findUserByEmail(email);
        if (!user || !user.password_hash || !user.salt) {
            return createErrorResponse("Nieprawidłowe dane logowania", 401);
        }

        // Weryfikacja hasła
        const attemptHash = hashPassword(password, user.salt);
        if (attemptHash !== user.password_hash) {
            return createErrorResponse("Nieprawidłowe dane logowania", 401);
        }

        // Utworzenie tokena JWT
        const token = createJwt({ sub: user.id, email: user.email });

        // Odpowiedź z ciasteczkiem
        const res = NextResponse.json({
            ok: true,
            user: { id: user.id, email: user.email },
        });

        const maxAge = 60 * 60 * 24 * 7; // 7 dni
        res.headers.set(
            "Set-Cookie",
            `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure=${
                process.env.NODE_ENV === "production"
            }`
        );

        return res;
    } catch (error) {
        console.error("Login error:", error);
        return createErrorResponse("Błąd serwera", 500);
    }
}
