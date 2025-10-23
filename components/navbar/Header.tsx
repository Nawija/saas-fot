import Link from "next/link";
import { getUser } from "@/lib/auth/getUser";
import LogoutButton from "../buttons/LogoutButton";

export default async function Header() {
    const user = await getUser();

    // 🔹 Wyciągamy nazwę użytkownika z emaila
    const username = user?.email ? user.email.split("@")[0] : null;
    return (
        <header className="bg-white p-4">
            <nav className="flex items-center justify-between mx-auto max-w-7xl">
                <Link href="/" className="text-xl font-semibold">
                    SaaS
                </Link>
                {user ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-700">
                            Zalogowany jako: <b>{username}</b>
                        </span>
                        <LogoutButton />
                    </div>
                ) : (
                    <Link href="/login" className="underline">
                        Zaloguj się
                    </Link>
                )}
            </nav>
        </header>
    );
}
