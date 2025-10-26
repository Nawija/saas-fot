"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthSidePanel from "@/components/auth/AuthSidePanel";
import Link from "next/link";
import FormInput from "@/components/auth/FormInput";
import ErrorMessage from "@/components/auth/ErrorMessage";
import CountdownTimer from "@/components/CountdownTimer";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "code" | "success">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
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

            if (!res.ok) {
                throw new Error(data.error || "Błąd wysyłania kodu");
            }

            setStep("code");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Hasła nie są zgodne");
            return;
        }

        if (newPassword.length < 8) {
            setError("Hasło musi mieć minimum 8 znaków");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    code,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Błąd resetowania hasła");
            }

            setStep("success");
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full bg-white overflow-hidden flex flex-col md:flex-row">
                {/* LEWA STRONA */}
                <AuthSidePanel subtitle="Reset your password securely" />

                {/* PRAWA STRONA */}
                <div className="w-full md:w-1/3 mx-auto p-10 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {step === "email" && (
                            <motion.div
                                key="email-step"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h1 className="text-3xl font-semibold text-center text-blue-700 mb-2">
                                    Zapomniałeś hasła?
                                </h1>
                                <p className="text-center text-gray-500 mb-6">
                                    Wyślemy Ci kod resetujący na email
                                </p>

                                <ErrorMessage message={error} />

                                <form
                                    onSubmit={handleSendCode}
                                    className="space-y-4"
                                >
                                    <FormInput
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={setEmail}
                                        required
                                    />

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                                    >
                                        {loading
                                            ? "Wysyłanie..."
                                            : "Wyślij kod"}
                                    </button>

                                    <p className="text-center text-sm text-gray-600 mt-4">
                                        <Link
                                            href="/login"
                                            className="text-blue-600 hover:underline"
                                        >
                                            Powrót do logowania
                                        </Link>
                                    </p>
                                </form>
                            </motion.div>
                        )}

                        {step === "code" && (
                            <motion.div
                                key="code-step"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h1 className="text-3xl font-semibold text-center text-blue-700 mb-2">
                                    Ustaw nowe hasło
                                </h1>
                                <p className="text-center text-gray-500 mb-2">
                                    Kod wysłano na <b>{email}</b>
                                </p>
                                <div className="text-center text-sm text-gray-500 mb-6">
                                    Kod wygaśnie za:{" "}
                                    <CountdownTimer
                                        minutes={10}
                                        onExpire={() =>
                                            setError(
                                                "Kod wygasł. Spróbuj ponownie."
                                            )
                                        }
                                    />
                                </div>

                                <ErrorMessage message={error} />

                                <form
                                    onSubmit={handleResetPassword}
                                    className="space-y-4"
                                >
                                    <FormInput
                                        label="Kod weryfikacyjny"
                                        type="text"
                                        value={code}
                                        onChange={setCode}
                                        maxLength={6}
                                        className="text-center tracking-widest font-mono"
                                        required
                                    />

                                    <FormInput
                                        label="Nowe hasło"
                                        type="password"
                                        value={newPassword}
                                        onChange={setNewPassword}
                                        required
                                    />

                                    <FormInput
                                        label="Potwierdź hasło"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                        required
                                    />

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                                    >
                                        {loading
                                            ? "Resetowanie..."
                                            : "Zresetuj hasło"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="w-full text-sm text-gray-500 hover:underline mt-2"
                                    >
                                        Wróć
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success-step"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="text-center"
                            >
                                <div className="mb-6">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg
                                            className="w-10 h-10 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <h1 className="text-3xl font-semibold text-green-600 mb-2">
                                        Hasło zresetowane!
                                    </h1>
                                    <p className="text-gray-600">
                                        Przekierowujemy Cię do logowania...
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
