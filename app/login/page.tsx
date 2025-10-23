"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Błąd logowania");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("Błąd sieci lub serwera");
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        window.location.href = "/api/auth/google/start";
    };

    return (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8">
                <h1 className="text-2xl font-semibold text-center mb-6">
                    Logowanie
                </h1>

                {error && (
                    <p className="text-red-500 text-sm text-center mb-3">
                        {error}
                    </p>
                )}

                <div className="my-6 flex flex-col items-center">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full border py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-100 transition"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        <span>Zaloguj się przez Google</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        {loading ? "Logowanie..." : "Zaloguj się"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm">
                    Nie masz konta?{" "}
                    <a
                        href="/register"
                        className="text-blue-600 hover:underline"
                    >
                        Zarejestruj się
                    </a>
                </p>
            </div>
        </div>
    );
}
