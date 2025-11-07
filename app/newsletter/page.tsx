"use client";

import { useState } from "react";
import { EmailInput } from "@/components/ui/email-input";
import {
    Mail,
    CheckCircle,
    AlertCircle,
    UserMinus,
    Loader2,
    Sparkles,
    Shield,
    Bell,
    ArrowRight,
} from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

export default function NewsletterPage() {
    const [email, setEmail] = useState("");
    const [unsubEmail, setUnsubEmail] = useState("");
    const [status, setStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");
    const [unsubStatus, setUnsubStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");
    const [message, setMessage] = useState("");
    const [unsubMessage, setUnsubMessage] = useState("");

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const response = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus("success");
                setMessage(data.message);
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to subscribe");
            }
        } catch (error) {
            setStatus("error");
            setMessage("An error occurred. Please try again.");
        }
    };

    const handleUnsubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setUnsubStatus("loading");
        setUnsubMessage("");

        try {
            const response = await fetch("/api/newsletter/unsubscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: unsubEmail }),
            });

            const data = await response.json();

            if (response.ok) {
                setUnsubStatus("success");
                setUnsubMessage(data.message);
                setUnsubEmail("");
            } else {
                setUnsubStatus("error");
                setUnsubMessage(data.error || "Failed to unsubscribe");
            }
        } catch (error) {
            setUnsubStatus("error");
            setUnsubMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-pink-50 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse-slow animation-delay-2000" />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-200 rounded-full blur-3xl opacity-15 animate-pulse-slow animation-delay-4000" />

            <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
                <div className="max-w-4xl mx-auto">
                    {/* Subscribe Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-purple-600 to-blue-600 rounded-2xl mb-6 shadow-lg">
                            <Mail className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Stay in the Loop
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                            Get exclusive tips, updates, and behind-the-scenes
                            content delivered straight to your inbox.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                                <Sparkles className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Exclusive Content
                            </h3>
                            <p className="text-sm text-gray-600">
                                Be the first to access premium photography tips
                                and tutorials.
                            </p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <Bell className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Weekly Updates
                            </h3>
                            <p className="text-sm text-gray-600">
                                Stay informed with curated industry news and
                                platform updates.
                            </p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Privacy First
                            </h3>
                            <p className="text-sm text-gray-600">
                                Your email is safe. No spam, no sharing, ever.
                            </p>
                        </div>
                    </div>

                    {/* Subscribe Form */}
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20">
                        <form onSubmit={handleSubscribe} className="space-y-6">
                            <div className="space-y-4">
                                <EmailInput
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    required
                                    disabled={status === "loading"}
                                    className="h-14 text-lg"
                                />

                                <MainButton
                                    type="submit"
                                    loading={status === "loading"}
                                    loadingText="Subscribing..."
                                    icon={<Mail className="w-5 h-5" />}
                                    label="Subscribe to Newsletter"
                                    className="w-full"
                                />
                            </div>

                            {/* Status Messages */}
                            {status === "success" && (
                                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-green-900">
                                            Welcome aboard! 🎉
                                        </p>
                                        <p className="text-sm text-green-700">
                                            {message}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {status === "error" && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-900">
                                            Oops! Something went wrong
                                        </p>
                                        <p className="text-sm text-red-700">
                                            {message}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>No spam, ever</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Unsubscribe anytime</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>100% free</span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative my-16">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-linear-to-br from-indigo-50 via-white to-pink-50 text-gray-500">
                                or
                            </span>
                        </div>
                    </div>

                    {/* Unsubscribe Section */}
                    <div className="bg-linear-to-br from-gray-50 to-gray-100/50 backdrop-blur-sm rounded-3xl p-8 sm:p-10 border border-gray-200">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-2xl mb-4">
                                <UserMinus className="w-8 h-8 text-gray-600" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                                Need to Unsubscribe?
                            </h2>
                            <p className="text-gray-600 max-w-md mx-auto">
                                We're sorry to see you go. Enter your email
                                below to stop receiving our newsletter.
                            </p>
                        </div>

                        <form
                            onSubmit={handleUnsubscribe}
                            className="max-w-md mx-auto space-y-4"
                        >
                            <EmailInput
                                value={unsubEmail}
                                onChange={(e) => setUnsubEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                required
                                disabled={unsubStatus === "loading"}
                                className="h-14 text-lg bg-white"
                            />

                            <button
                                type="submit"
                                disabled={unsubStatus === "loading"}
                                className="w-full h-14 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow flex items-center justify-center gap-2 text-lg"
                            >
                                {unsubStatus === "loading" ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Unsubscribing...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserMinus className="w-5 h-5" />
                                        <span>Unsubscribe</span>
                                    </>
                                )}
                            </button>

                            {/* Unsubscribe Status Messages */}
                            {unsubStatus === "success" && (
                                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-green-900">
                                            Successfully unsubscribed
                                        </p>
                                        <p className="text-sm text-green-700">
                                            {unsubMessage}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {unsubStatus === "error" && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-900">
                                            Error
                                        </p>
                                        <p className="text-sm text-red-700">
                                            {unsubMessage}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer info */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-500">
                            Have questions?{" "}
                            <a
                                href="/support"
                                className="text-purple-600 hover:text-purple-700 font-medium underline underline-offset-2"
                            >
                                Contact support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
