import Link from "next/link";
import { getUser } from "@/lib/auth/getUser";
import UserDropdown from "./UserDropdown";

export default async function Header() {
    const user = await getUser();
    const username = user?.name || user?.email?.split("@")[0];
    return (
        <header className="bg-white p-4 shadow-sm">
            <nav className="flex items-center justify-between mx-auto max-w-7xl">
                <Link href="/" className="text-xl font-semibold">
                    SaaS
                </Link>

                {user ? (
                    <div className="flex items-center justify-center text-sm text-gray-500 gap-3">
                        <b>{username}</b>
                        <UserDropdown
                            name={user.name}
                            email={user.email}
                            avatar={user.avatar}
                        />
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
