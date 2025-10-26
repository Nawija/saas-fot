import Link from "next/link";
import { getUser } from "@/lib/auth/getUser";
import UserDropdown from "./UserDropdown";
import Image from "next/image";

export default async function Header() {
    const user = await getUser();
    const username = user?.name?.split(" ")[0] || user?.email?.split("@")[0];
    return (
        <header className="bg-white p-4 shadow-sm border-b border-gray-200">
            <nav className="flex items-center justify-between mx-auto">
                <Link
                    href="/dashboard"
                    className="text-base lg:hidden font-semibold flex items-center gap-2 text-gray-700"
                >
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        className="h-7 w-auto"
                        height={20}
                        width={20}
                    />
                    <span>Seovileo</span>
                </Link>
                <p className="hidden lg:block font-semibold text-gray-700">Hello {username}</p>

                {user ? (
                    <div className="flex items-center justify-center text-sm text-gray-500 gap-3">
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
