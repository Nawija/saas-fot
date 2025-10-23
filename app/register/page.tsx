"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CountdownTimer from "@/components/CountdownTimer";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCodeStep, setShowCodeStep] = useState(false);

    // 🔹 Pierwszy etap — wysłanie kodu
    async function handleSendCode(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Błąd wysyłki maila");

            // ✅ Kod wysłany — przejdź do drugiego etapu
            setShowCodeStep(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // 🔹 Drugi etap — potwierdzenie kodu i rejestracja
    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, code }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Błąd rejestracji");

            router.push("/login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8">
                <h1 className="text-2xl font-semibold text-center mb-6">
                    Rejestracja
                </h1>

                {error && (
                    <p className="text-red-500 text-sm text-center mb-3">
                        {error}
                    </p>
                )}

                {/* 🔹 Etap 1 — email i hasło */}
                {!showCodeStep ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Hasło
                            </label>
                            <input
                                type="password"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? "Wysyłanie..." : "Zarejestruj się"}
                        </button>
                        <p className="mt-6 text-center text-sm">
                            Masz juz konto?{" "}
                            <a
                                href="/login"
                                className="text-blue-600 hover:underline"
                            >
                                Zaloguj sie
                            </a>
                        </p>
                    </form>
                ) : (
                    // 🔹 Etap 2 — wpisanie kodu
                    <form onSubmit={handleRegister} className="space-y-4">
                        <p className="text-center text-gray-600">
                            Wysłaliśmy 6-cyfrowy kod na adres <b>{email}</b>.
                        </p>

                        <div className="text-center text-sm text-gray-500 mb-2">
                            Kod wygaśnie za:{" "}
                            <CountdownTimer
                                minutes={5}
                                onExpire={() => {
                                    setError("Kod wygasł");
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Kod weryfikacyjny
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                maxLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            {loading ? "Rejestrowanie..." : "Potwierdź kod"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowCodeStep(false)}
                            className="w-full text-sm text-gray-500 hover:underline mt-2"
                        >
                            Wróć
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
