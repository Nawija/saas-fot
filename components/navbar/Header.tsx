import Link from "next/link";
import { getUser } from "@/lib/auth/getUser";
import LogoutButton from "../buttons/LogoutButton";

export default async function Header() {
    const user = await getUser();

    const username = user?.name.split(" ")[0] || user?.email?.split("@")[0];
    const avatar = user?.avatar || "/avatar.jpg";

    return (
        <header className="bg-white p-4 shadow-sm">
            <nav className="flex items-center justify-between mx-auto max-w-7xl">
                <Link href="/" className="text-xl font-semibold">
                    SaaS
                </Link>

                {user ? (
                    <div className="flex items-center gap-3">
                        <img
                            src={avatar}
                            alt={username || "Avatar"}
                            className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                        />
                        <span className="text-sm text-gray-700">
                            <b>{username}</b>
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
