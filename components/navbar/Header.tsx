import Link from "next/link";
import { getUser } from "@/lib/auth/getUser";
import UserDropdown from "./UserDropdown";
import Image from "next/image";

export default async function Header() {
    const user = await getUser();
    const username = user?.name?.split(" ")[0] || user?.email?.split("@")[0];
    return (
        <header className="bg-white p-4 shadow-sm">
            <nav className="flex items-center justify-between mx-auto max-w-7xl">
                <Link href="/dashboard" className="text-base font-semibold flex items-center gap-2 text-gray-700">
                    <Image src="/logo.svg" alt="Logo" className="h-7 w-auto" height={20} width={20} />
                    <span>Seovileo</span>
                </Link>

                {user ? (
                    <div className="flex items-center justify-center text-sm text-gray-500 gap-3">
                        <b>{username}</b>
                        <UserDropdown
                            name={user.name}
                            email={user.email}
                            avatar={user.avatar}
                            provider={user.provider}
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
