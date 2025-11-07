"use client";

import { useState } from "react";
import { EmailInput } from "@/components/ui/email-input";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");
    const [message, setMessage] = useState("");

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

    return (
        <section className="py-20 px-4 sm:px-6 bg-linear-to-br from-indigo-50 via-white to-pink-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-purple-600 to-blue-600 rounded-full mb-6">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Stay Updated with Our Newsletter
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Get the latest tips, updates, and exclusive content
                        delivered to your inbox daily.
                    </p>
                </div>

                <form onSubmit={handleSubscribe} className="max-w-xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <EmailInput
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                            disabled={status === "loading"}
                            className="flex-1 h-14"
                        />
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {status === "loading" ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Subscribing...</span>
                                </>
                            ) : (
                                <>
                                    <Mail className="w-5 h-5" />
                                    <span>Subscribe</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Status Messages */}
                    {status === "success" && (
                        <div className="mt-4 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-900">
                                    Success!
                                </p>
                                <p className="text-sm text-green-700">
                                    {message}
                                </p>
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-900">
                                    Error
                                </p>
                                <p className="text-sm text-red-700">
                                    {message}
                                </p>
                            </div>
                        </div>
                    )}
                </form>

                <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
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
        </section>
    );
}
