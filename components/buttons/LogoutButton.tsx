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
            className="flex items-center justify-start text-red-700 gap-1.5 hover:bg-red-50 p-2 rounded-lg w-full h-full font-medium text-sm"
        >
            <LogOut size={18} strokeWidth={2} className="text-red-700" />
            <span>Logout</span>
        </button>
    );
}
