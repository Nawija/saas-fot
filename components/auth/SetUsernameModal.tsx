"use client";

import { useState } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import MainButton from "@/components/buttons/MainButton";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SetUsernameModalProps {
    open: boolean;
    onSuccess: (username: string) => void;
}

export default function SetUsernameModal({
    open,
    onSuccess,
}: SetUsernameModalProps) {
    const [username, setUsername] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (!username.trim()) {
            setError("Domain is required");
            return;
        }

        if (username.length < 2) {
            setError("Domain must be at least 2 characters");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const res = await fetch("/api/user/username", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            const data = await res.json();

            if (!res.ok) {
                // If username already set, close modal and refresh
                if (data.error?.includes("already been set")) {
                    toast.info("Domain already set");
                    onSuccess(username);
                    return;
                }
                setError(data.error || "Failed to set username");
                return;
            }

            // 🎉 Success - Fire confetti!
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = {
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 9999,
            };

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }

            const interval: NodeJS.Timeout = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // Fire from left side
                confetti({
                    ...defaults,
                    particleCount,
                    origin: {
                        x: randomInRange(0.1, 0.3),
                        y: Math.random() - 0.2,
                    },
                });

                // Fire from right side
                confetti({
                    ...defaults,
                    particleCount,
                    origin: {
                        x: randomInRange(0.7, 0.9),
                        y: Math.random() - 0.2,
                    },
                });
            }, 250);

            toast.success("Domain set successfully! 🎉");

            // Wait a bit for confetti, then close
            setTimeout(() => {
                onSuccess(username);
            }, 1500);
        } catch (error) {
            console.error("Error setting username:", error);
            setError("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleUsernameChange = (value: string) => {
        // Allow only lowercase letters, numbers, and hyphens
        const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
        setUsername(cleaned);
        setError("");
    };

    return (
        <AlertDialog open={open}>
            <AlertDialogContent className=" w-[95vw] max-w-md p-6">
                <AlertDialogHeader>
                    <AlertDialogTitle>Choose your domain 🎉</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your domain will be used for all your galleries
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Your domain
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) =>
                                    handleUsernameChange(e.target.value)
                                }
                                placeholder="john"
                                maxLength={63}
                                autoFocus
                                className="flex-1 px-4 py-2 border-2 text-sm border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                            />
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                                .seovileo.pl
                            </span>
                        </div>
                        {error && (
                            <p className="text-xs text-red-600">{error}</p>
                        )}
                        {username && !error && (
                            <p className="text-xs text-gray-500">
                                All your galleries will be at:{" "}
                                <strong className="text-blue-600">
                                    https://{username}.seovileo.pl
                                </strong>
                            </p>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-xs text-blue-900">
                            <strong>Domain requirements:</strong>
                        </p>
                        <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                            <li>
                                Lowercase letters, numbers, and hyphens only
                            </li>
                            <li>Minimum 2 characters</li>
                            <li>Must be unique - nobody else can use it</li>
                            <li className="text-red-700">⚠️ Cannot be changed after creation ⚠️</li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end">
                    <MainButton
                        onClick={handleSave}
                        label="Continue"
                        variant="primary"
                        loading={saving}
                        disabled={!username || username.length < 2 || saving}
                        className="w-full sm:w-auto"
                    />
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
