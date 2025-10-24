"use client";

import { useState } from "react";
import CountdownTimer from "@/components/CountdownTimer";

export default function ChangePasswordPage() {
    const [email, setEmail] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState(false);
    const [showCodeStep, setShowCodeStep] = useState(false);
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function fetchUserEmail() {
        try {
            const res = await fetch("/api/user/me"); // endpoint zwracający dane zalogowanego użytkownika
            const data = await res.json();
            if (res.ok) setEmail(data.email);
        } catch {
            setError("Nie udało się pobrać danych użytkownika.");
        }
    }

    // uruchamiane przy wejściu na stronę
    if (email === null) fetchUserEmail();

    async function handleSendCode() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/user/send-change-code", {
                method: "POST",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setShowCodeStep(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, newPassword, confirmPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSuccess("Hasło zostało zmienione pomyślnie!");
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
                    Zmień hasło
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

                {!confirmed ? (
                    <div className="space-y-4 text-center">
                        <p>
                            Twój adres e-mail: <b>{email || "Ładowanie..."}</b>
                        </p>
                        <button
                            onClick={() => setConfirmed(true)}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Chcę zmienić hasło
                        </button>
                    </div>
                ) : !showCodeStep ? (
                    <div className="space-y-4 text-center">
                        <p>Czy na pewno chcesz zmienić swoje hasło?</p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={handleSendCode}
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                {loading ? "Wysyłanie..." : "Tak, wyślij kod"}
                            </button>
                            <button
                                onClick={() => setConfirmed(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                            >
                                Anuluj
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <p className="text-center text-gray-600">
                            Kod wysłano na <b>{email}</b>.
                        </p>
                        <div className="text-center text-sm text-gray-500 mb-2">
                            Kod wygaśnie za: <CountdownTimer minutes={5} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Kod weryfikacyjny
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
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Powtórz nowe hasło
                            </label>
                            <input
                                type="password"
                                className="w-full border rounded-lg px-3 py-2"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            {loading ? "Zapisywanie..." : "Zmień hasło"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
