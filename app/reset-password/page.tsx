"use client";

import { useState } from "react";
import CountdownTimer from "@/components/CountdownTimer";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showCodeStep, setShowCodeStep] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSendCode(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/send-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Błąd wysyłki maila");
            setShowCodeStep(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleReset(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Błąd resetu hasła");
            setSuccess("Hasło zostało zmienione! Możesz się zalogować.");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8">
                <h1 className="text-2xl font-semibold text-center mb-6">
                    Reset hasła
                </h1>
                {error && (
                    <p className="text-red-500 text-sm text-center mb-3">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="text-green-500 text-sm text-center mb-3">
                        {success}
                    </p>
                )}

                {!showCodeStep ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full border rounded-lg px-3 py-2"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? "Wysyłanie..." : "Wyślij kod resetu"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <p className="text-center text-gray-600">
                            Kod wysłano na <b>{email}</b>
                        </p>
                        <div className="text-center text-sm text-gray-500 mb-2">
                            Kod wygasa za: <CountdownTimer minutes={10} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Kod
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                className="w-full border rounded-lg px-3 py-2 text-center tracking-widest font-mono"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Nowe hasło
                            </label>
                            <input
                                type="password"
                                className="w-full border rounded-lg px-3 py-2"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            {loading ? "Zmiana..." : "Zmień hasło"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
