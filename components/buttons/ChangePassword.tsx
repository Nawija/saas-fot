"use client";

import { useRouter } from "next/navigation";

export default function ChangePassword() {
    const router = useRouter();

    const handleChangePass = async () => {
        await fetch("/api/auth/reset-password", { method: "POST" });
        router.push("/dashboard/u/reset-password");
    };

    return (
        <button
            onClick={handleChangePass}
            className=" flex items-center justify-start text-blue-700 text-sm w-full h-full gap-1"
        >
            <p>Zmien Haslo</p>
        </button>
    );
}
