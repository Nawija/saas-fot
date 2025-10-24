import { NextRequest, NextResponse } from "next/server";
import {
    genSalt,
    hashPassword,
    createUserWithEmail,
    findUserByEmail,
} from "@/lib/auth";
import { createErrorResponse } from "@/lib/utils/apiHelpers";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, code } = body;

        // Walidacja danych wejściowych
        if (!email || !password || !code) {
            return createErrorResponse("Brak wymaganych danych", 400);
        }

        // Pobierz kod weryfikacyjny z ciasteczek
        const cookieCode = req.cookies.get("verification_code")?.value;
        const cookieEmail = req.cookies.get("verification_email")?.value;

        if (!cookieCode || !cookieEmail) {
            return createErrorResponse("Kod weryfikacyjny wygasł", 400);
        }

        // Weryfikacja kodu
        if (email !== cookieEmail || code !== cookieCode) {
            return createErrorResponse("Nieprawidłowy kod weryfikacyjny", 400);
        }

        // Sprawdź czy użytkownik już istnieje
        const existing = await findUserByEmail(email);
        if (existing) {
            return createErrorResponse("Użytkownik już istnieje", 409);
        }

        // Utwórz nowego użytkownika
        const salt = genSalt();
        const hash = hashPassword(password, salt);
        const user = await createUserWithEmail(email, hash, salt);

        // Usuń kod weryfikacyjny po użyciu
        const res = NextResponse.json({
            ok: true,
            user: { id: user.id, email: user.email },
        });

        res.cookies.delete("verification_code");
        res.cookies.delete("verification_email");

        return res;
    } catch (error) {
        console.error("Register error:", error);
        return createErrorResponse("Błąd serwera", 500);
    }
}
