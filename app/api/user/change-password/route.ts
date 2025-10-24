import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { genSalt, hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";
import { createErrorResponse } from "@/lib/utils/apiHelpers";

export async function POST(req: NextRequest) {
    try {
        const { code, newPassword, confirmPassword } = await req.json();

        // Walidacja danych wejściowych
        if (!code || !newPassword || !confirmPassword) {
            return createErrorResponse("Wszystkie pola są wymagane", 400);
        }

        if (newPassword !== confirmPassword) {
            return createErrorResponse("Hasła nie są takie same", 400);
        }

        if (newPassword.length < 6) {
            return createErrorResponse("Hasło musi mieć minimum 6 znaków", 400);
        }

        // Pobierz kod z ciasteczek
        const cookieCode = req.cookies.get("change_code")?.value;
        const cookieEmail = req.cookies.get("change_email")?.value;

        if (!cookieCode || !cookieEmail) {
            return createErrorResponse(
                "Kod wygasł lub jest nieprawidłowy",
                400
            );
        }

        if (code !== cookieCode) {
            return createErrorResponse("Nieprawidłowy kod weryfikacyjny", 400);
        }

        // Sprawdź użytkownika
        const user = await getUser();
        if (!user || user.email !== cookieEmail) {
            return createErrorResponse("Nieautoryzowany", 401);
        }

        // Sprawdź czy użytkownik ma provider 'email'
        if (user.provider !== "email") {
            return createErrorResponse(
                "Zmiana hasła dostępna tylko dla kont z emailem",
                403
            );
        }

        // Zmień hasło
        const salt = genSalt();
        const hash = hashPassword(newPassword, salt);

        await query(
            `UPDATE users SET password_hash = $1, salt = $2 WHERE email = $3`,
            [hash, salt, user.email]
        );

        // Usuń kod z ciasteczek
        const res = NextResponse.json({
            ok: true,
            message: "Hasło zostało zmienione pomyślnie",
        });
        res.cookies.delete("change_code");
        res.cookies.delete("change_email");

        return res;
    } catch (error) {
        console.error("Change password error:", error);
        return createErrorResponse("Błąd serwera", 500);
    }
}
