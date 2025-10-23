"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className=" flex items-center justify-center text-red-600 text-sm gap-1 font-semibold"
        >
            <LogOut size={16} className="text-red-600" />
            <p>Wyloguj</p>
        </button>
    );
}
