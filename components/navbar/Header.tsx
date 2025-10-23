import Link from "next/link";
import { getUser } from "@/lib/auth/getUser";

export default async function Header() {
    const user = await getUser();
    return (
        <header className="bg-white p-4">
            <nav className="flex items-center justify-between mx-auto max-w-7xl">
                <Link href="/" className="text-xl font-semibold">
                    SaaS
                </Link>
                {user ? (
                    <span className="text-sm text-gray-700">
                        Zalogowany jako: <b>{user.email}</b>
                    </span>
                ) : (
                    <Link href="/login" className="underline">
                        Zaloguj się
                    </Link>
                )}
            </nav>
        </header>
    );
}
