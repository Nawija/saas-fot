// /app/dashboard/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/components/buttons/LogoutButton";

async function getUserFromToken(token: string | undefined) {
    if (!token) return null;
    try {
        const secret = process.env.JWT_SECRET!;
        const payload = jwt.verify(token, secret) as any;
        const res = await query("SELECT id, email FROM users WHERE id = $1", [
            payload.sub,
        ]);
        return res.rows[0] ?? null;
    } catch (e) {
        return null;
    }
}


export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await getUserFromToken(token);

    if (!user) {
        // redirect to home (client-side redirect)
        // In app router we can throw a redirect, but to keep simple:
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>
                    <h2 className="text-xl font-semibold">
                        Nie jesteś zalogowany
                    </h2>
                    <p>
                        <Link href="/login" className="underline">
                            Zaloguj
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold">Panel użytkownika</h1>
            <p className="mt-4">Witaj, {user.email}</p>
            <LogoutButton />
        </main>
    );
}
