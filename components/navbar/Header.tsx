import Link from "next/link";
import { getUser } from "@/lib/auth/getUser";
import UserDropdown from "./UserDropdown";
import Image from "next/image";

export default async function Header() {
    const user = await getUser();
    return (
        <header className="bg-white py-3 px-4 lg:px-8">
            <nav className="flex items-center justify-between mx-auto ">
                <Link
                    href="/dashboard"
                    className="text-base font-semibold flex items-center gap-2 text-gray-700"
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

                {user ? (
                    <div className="flex items-center justify-center text-sm text-gray-500 gap-3">
                        {/* Slot for menu button - injected by DashboardLayoutClient */}
                        <UserDropdown
                            name={user.name}
                            email={user.email}
                            avatar={user.avatar}
                            provider={user.provider}
                        />
                        <div id="dashboard-menu-slot" />
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
