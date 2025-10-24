"use client";

import { useRouter } from "next/navigation";

export default function ChangePassword() {
    const router = useRouter();

    const handleChangePass = async () => {
        await fetch("/api/auth/reset-password", { method: "POST" });
        router.push("/reset-password");
    };

    return (
        <button
            onClick={handleChangePass}
            className=" flex items-center justify-center text-red-600 text-sm gap-1 font-semibold"
        >
            <p>Zmien Haslo</p>
        </button>
    );
}
