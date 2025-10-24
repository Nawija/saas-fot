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
            className="flex items-center justify-start gap-1.5 w-full h-full font-medium text-sm"
        >
            <LogOut size={18} strokeWidth={3} />
            <span>Wyloguj</span>
        </button>
    );
}
