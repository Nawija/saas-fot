"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/avatar";
import { PLANS, formatBytes } from "@/lib/plans";
import PricingCards from "@/components/pricing/PricingCards";
import Loading from "@/components/ui/Loading";
import {
    TrendingUp,
    Shield,
    Crown,
    Database,
    CheckCircle2,
    AlertTriangle,
    CreditCard,
    ArrowRight,
} from "lucide-react";

export default function BillingPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    // If navigating with #plans hash, smooth scroll after data loads
    useEffect(() => {
        if (loading) return;
        if (typeof window === "undefined") return;
        if (window.location.hash === "#plans") {
            const el = document.getElementById("plans");
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 60);
            }
        }
    }, [loading]);

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user/me");
            const data = await res.json();
            if (data.ok) {
                setUser(data.user);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Login required
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Please sign in to view billing options
                    </p>
                </div>
            </div>
        );
    }

    const currentPlan = PLANS[user.subscription_plan || "free"];
    const storageUsed = user.storage_used || 0;
    const storageLimit = user.storage_limit || 2147483648;
    const storagePercent =
        storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;
    const visualPercent = Math.max(
        storagePercent,
        storagePercent > 0 ? 0.5 : 0
    );

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-linear-to-br from-indigo-100 via-purple-50 to-pink-50 border-b border-gray-200">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-size-[20px_20px]"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                            <Crown className="w-4 h-4 text-gray-800" />
                            <span className="text-xs font-semibold text-gray-800">
                                Subscription & Billing
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                            Manage Your Plan
                        </h1>
                        <p className="text-sm sm:text-base text-gray-800/90 max-w-2xl mx-auto">
                            Monitor storage and upgrade your plan
                        </p>
                    </div>
                </div>
            </div>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Current Plan Card */}
                <div className="mb-6 sm:mb-8 max-w-5xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
                        {/* Plan Header */}
                        <div className="bg-linear-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                        <Crown className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-purple-600 mb-1">
                                            Current Plan
                                        </p>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                                            {currentPlan.name}
                                        </h2>
                                        {currentPlan.price > 0 ? (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-gray-800">
                                                    ${currentPlan.price}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    /month
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-gray-600 text-base font-medium">
                                                Free Forever
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-2">
                                        Status
                                    </p>
                                    <span
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                                            user.subscription_status ===
                                            "active"
                                                ? "bg-emerald-500 text-white"
                                                : user.subscription_status ===
                                                  "cancelled"
                                                ? "bg-red-500 text-white"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                    >
                                        {user.subscription_status ===
                                        "active" ? (
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        ) : (
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                        )}
                                        {user.subscription_status === "active"
                                            ? "Active"
                                            : user.subscription_status ===
                                              "cancelled"
                                            ? "Cancelled"
                                            : "None"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Storage Usage Section */}
                    <div className="p-4 sm:p-5 bg-linear-to-br from-blue-50/30 to-purple-50/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                <Database className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-800">
                                    Storage Usage
                                </h3>
                                <p className="text-xs text-gray-600">
                                    {formatBytes(storageUsed)} of{" "}
                                    {formatBytes(storageLimit)} used
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative">
                            <div className="w-full bg-purple-100/50 rounded-full h-3 overflow-hidden border border-purple-200/50">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                                        storagePercent >= 90
                                            ? "bg-linear-to-r from-red-400 via-pink-400 to-orange-400"
                                            : storagePercent >= 70
                                            ? "bg-linear-to-r from-yellow-300 via-orange-300 to-pink-300"
                                            : "bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400"
                                    }`}
                                    style={{
                                        width: `${Math.min(
                                            visualPercent,
                                            100
                                        )}%`,
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white/20"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <p className="text-xs font-bold text-gray-700">
                                    {storagePercent < 0.1 && storagePercent > 0
                                        ? "< 0.1%"
                                        : `${storagePercent.toFixed(1)}%`}
                                </p>
                                <p className="text-xs font-medium text-gray-600">
                                    {storagePercent < 50 &&
                                        "🎉 Plenty of space"}
                                    {storagePercent >= 50 &&
                                        storagePercent < 80 &&
                                        "✅ Looking good"}
                                    {storagePercent >= 80 &&
                                        storagePercent < 90 &&
                                        "⚡ Upgrade soon"}
                                    {storagePercent >= 90 && "⚠️ Almost full"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Portal Link */}
                    {user.lemon_squeezy_customer_id &&
                        user.subscription_status === "active" && (
                            <div className="p-4 sm:p-5 border-t border-purple-100">
                                <div className="bg-linear-to-br from-indigo-50/50 to-purple-50/50 rounded-lg p-4 border border-indigo-100">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                            <CreditCard className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-800 mb-1">
                                                Manage Subscription
                                            </h4>
                                            <p className="text-xs text-gray-600 mb-3">
                                                Update payment or view invoices
                                            </p>
                                            <a
                                                href="https://app.lemonsqueezy.com/my-orders"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500 text-white text-xs font-semibold rounded-lg hover:bg-purple-600 transition-colors group"
                                            >
                                                <span>Open Portal</span>
                                                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>

                {/* Storage Warning Alert */}
                {storagePercent >= 90 && (
                    <div className="mb-10">
                        <div className="bg-linear-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-red-900 mb-2">
                                        Running out of space for photos
                                    </h3>
                                    <p className="text-red-700 mb-3">
                                        You’ve already used{" "}
                                        <strong>
                                            {storagePercent.toFixed(0)}%
                                        </strong>{" "}
                                        of your available storage! Consider
                                        upgrading your plan to get more space
                                        for your galleries.
                                    </p>
                                    <button
                                        onClick={() => {
                                            document
                                                .getElementById("plans")
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                    block: "start",
                                                });
                                        }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <TrendingUp className="w-4 h-4" />
                                        See available plans
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Plans Section */}
                <div id="plans" className="mb-6 sm:mb-8 scroll-mt-6">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 px-3">
                            {user.subscription_plan === "free"
                                ? "Choose the perfect plan for you"
                                : "Change or upgrade your plan"}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                            {user?.subscription_plan === "free"
                                ? "Choose a plan that fits your needs"
                                : "Change or upgrade your plan anytime"}
                        </p>
                    </div>

                    <PricingCards
                        currentPlan={user?.subscription_plan || "free"}
                        userId={user?.id || 0}
                        userEmail={user?.email || ""}
                    />
                </div>

                {/* Trust Section */}
                <div className="bg-linear-to-br from-green-50/30 via-emerald-50/30 to-teal-50/30 rounded-xl p-5 sm:p-6 border border-green-100">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Shield className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800 mb-2">
                            Secure Payments
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-4">
                            All transactions handled by{" "}
                            <strong>Lemon Squeezy</strong> — trusted worldwide.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                <span>Cancel anytime</span>
                            </div>
                            <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                <span>No hidden fees</span>
                            </div>
                            <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                <span>Instant access</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
