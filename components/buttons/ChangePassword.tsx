"use client";

import { useRouter } from "next/navigation";
import { Key } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ChangePassword() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePass = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/user/send-change-code", {
                method: "POST",
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/dashboard/u/reset-password");
            } else {
                toast.error(data.error || "Błąd wysyłania kodu");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Wystąpił błąd. Spróbuj ponownie.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleChangePass}
            disabled={isLoading}
            className="flex items-center justify-start text-sm w-full h-full gap-1.5"
        >
            <Key size={16} />
            <p>{isLoading ? "Wysyłanie..." : "Zmień hasło"}</p>
        </button>
    );
}
