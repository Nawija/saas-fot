"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

export default function NewsletterPage() {
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-6">
                            <Mail className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                            Stay Updated
                        </h1>
                        <p className="text-xl text-gray-600">
                            Subscribe to our newsletter and get the latest
                            updates, tips, and exclusive content delivered to
                            your inbox daily.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">📰</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Daily Content
                            </h3>
                            <p className="text-sm text-gray-600">
                                Get fresh content delivered to your inbox every
                                day.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">💡</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Expert Tips
                            </h3>
                            <p className="text-sm text-gray-600">
                                Learn from industry experts and grow your
                                skills.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">🎁</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Exclusive Offers
                            </h3>
                            <p className="text-sm text-gray-600">
                                Be the first to know about special promotions.
                            </p>
                        </div>
                    </div>

                    {/* Subscription Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <form onSubmit={handleSubscribe} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={status === "loading"}
                                    className="w-full h-12 text-lg"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                {status === "loading" ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Subscribing...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Mail className="w-5 h-5" />
                                        Subscribe to Newsletter
                                    </span>
                                )}
                            </Button>

                            {/* Status Messages */}
                            {status === "success" && (
                                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
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
                                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
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

                        <p className="text-xs text-gray-500 text-center mt-6">
                            By subscribing, you agree to receive our newsletter.
                            You can unsubscribe at any time.
                        </p>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-600 mb-4">
                            Join thousands of subscribers who trust us
                        </p>
                        <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>No spam</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Unsubscribe anytime</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Free forever</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
