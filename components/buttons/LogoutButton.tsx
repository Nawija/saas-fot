"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-sm"
        >
            <LogOut size={18} />
            <span>Wyloguj</span>
        </button>
    );
}
