"use client";

import Link from "next/link";
import { useAuthUser } from "@/hooks/useAuthUser";
import UserDropdown from "./UserDropdown";
import Logo from "./Logo";

export default function Header() {
    const { user, loading } = useAuthUser();

    return (
        <header className="bg-white py-3 px-4 lg:px-8">
            <nav className="flex items-center justify-between mx-auto ">
                <Logo href="/dashboard" />

                {loading ? (
                    <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse mr-3" />
                ) : user ? (
                    <div className="flex items-center justify-center text-sm text-gray-500 gap-3">
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
                        Log in
                    </Link>
                )}
            </nav>
        </header>
    );
}
