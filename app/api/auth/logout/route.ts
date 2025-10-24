import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const res = NextResponse.json({
            ok: true,
            message: "Wylogowano pomyślnie",
        });

        // Usuń ciasteczko z tokenem
        res.headers.set(
            "Set-Cookie",
            `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure=${
                process.env.NODE_ENV === "production"
            }`
        );

        return res;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "Błąd podczas wylogowywania" },
            { status: 500 }
        );
    }
}
