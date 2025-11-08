"use client";

import { useState } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";

export default function ChangePasswordPage() {
    const router = useRouter();
    const { user } = useAuthUser();
    const [confirmed, setConfirmed] = useState(false);
    const [showCodeStep, setShowCodeStep] = useState(false);
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const email = user?.email || null;

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
            setSuccess("Password changed successfully!");

            await fetch("/api/auth/logout", { method: "POST" });

            setTimeout(() => {
                router.push("/login");
                router.refresh();
            }, 1000);
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
                    Change password
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
                            Your email address: <b>{email || "Loading..."}</b>
                        </p>
                        <button
                            onClick={() => setConfirmed(true)}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            I want to change my password
                        </button>
                    </div>
                ) : !showCodeStep ? (
                    <div className="space-y-4 text-center">
                        <p>Are you sure you want to change your password?</p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={handleSendCode}
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                {loading ? "Sending..." : "Yes, send the code"}
                            </button>
                            <button
                                onClick={() => setConfirmed(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <p className="text-center text-gray-600">
                            The code has been sent to <b>{email}</b>.
                        </p>
                        <div className="text-center text-sm text-gray-500 mb-2">
                            Code expires in: <CountdownTimer minutes={5} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Verification code
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
                                New password
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
                                Repeat new password
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
                            {loading ? "Saving..." : "Change password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
