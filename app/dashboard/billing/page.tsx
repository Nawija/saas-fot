"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/avatar";
import { PLANS, formatBytes } from "@/lib/plans";
import PricingCards from "@/components/pricing/PricingCards";
import { Sparkles, TrendingUp, Shield } from "lucide-react";

export default function BillingPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

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
        return (
            <div className="flex items-center justify-center min-h-screen ">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen ">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                        Zaloguj się, aby zobaczyć opcje płatności
                    </p>
                </div>
            </div>
        );
    }

    const currentPlan = PLANS[user.subscription_plan || "free"];

    // Oblicz procent wykorzystania storage bezpośrednio (z dokładnością do 2 miejsc po przecinku)
    const storageUsed = user.storage_used || 0;
    const storageLimit = user.storage_limit || 2147483648; // 2GB domyślnie

    const storagePercent =
        storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

    // Dla wyświetlania progress bara użyj co najmniej 0.5% żeby było widać
    const visualPercent = Math.max(
        storagePercent,
        storagePercent > 0 ? 0.5 : 0
    );

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                            Zarządzanie planem
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                        Twoja subskrypcja
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Zarządzaj planem i monitoruj wykorzystanie miejsca
                    </p>
                </div>

                {/* Current Plan Card */}
                <div className="mb-10">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                        {/* Plan Header with Gradient */}
                        <div className="bg-linear-to-r from-blue-500 to-blue-600 px-8 py-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="text-white">
                                    <p className="text-sm font-medium text-blue-100 mb-1">
                                        Aktualny plan
                                    </p>
                                    <h2 className="text-3xl font-bold mb-1">
                                        {currentPlan.name}
                                    </h2>
                                    {currentPlan.price > 0 ? (
                                        <p className="text-blue-100">
                                            <span className="text-2xl font-semibold text-white">
                                                ${currentPlan.price}
                                            </span>
                                            /miesiąc
                                        </p>
                                    ) : (
                                        <p className="text-blue-100">
                                            Plan darmowy
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-xs text-blue-100 mb-1">
                                            Status
                                        </p>
                                        <span
                                            className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold ${
                                                user.subscription_status ===
                                                "active"
                                                    ? "bg-green-400 text-green-900"
                                                    : user.subscription_status ===
                                                      "cancelled"
                                                    ? "bg-red-400 text-red-900"
                                                    : "bg-white/20 text-white"
                                            }`}
                                        >
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    user.subscription_status ===
                                                    "active"
                                                        ? "bg-green-900 animate-pulse"
                                                        : "bg-gray-400"
                                                }`}
                                            ></div>
                                            {user.subscription_status ===
                                            "active"
                                                ? "Aktywna"
                                                : user.subscription_status ===
                                                  "cancelled"
                                                ? "Anulowana"
                                                : "Brak subskrypcji"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Storage Usage */}
                        <div className="px-8 py-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gray-600" />
                                    <p className="text-sm font-semibold text-gray-900">
                                        Wykorzystane miejsce
                                    </p>
                                </div>
                                <p className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-1 rounded-lg">
                                    {formatBytes(storageUsed)} /{" "}
                                    {formatBytes(storageLimit)}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative">
                                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden ${
                                            storagePercent >= 90
                                                ? "bg-linear-to-r from-red-500 to-red-600"
                                                : storagePercent >= 70
                                                ? "bg-linear-to-r from-yellow-400 to-yellow-500"
                                                : "bg-linear-to-r from-blue-500 to-blue-600"
                                        }`}
                                        style={{
                                            width: `${Math.min(
                                                visualPercent,
                                                100
                                            )}%`,
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-gray-600 mt-2">
                                    {storagePercent < 0.1 && storagePercent > 0
                                        ? "< 0.1% wykorzystane"
                                        : `${storagePercent.toFixed(
                                              2
                                          )}% wykorzystane`}
                                    {storagePercent < 50 &&
                                        " - Dużo wolnego miejsca! 🎉"}
                                    {storagePercent >= 50 &&
                                        storagePercent < 80 &&
                                        " - W sam raz"}
                                    {storagePercent >= 80 &&
                                        storagePercent < 90 &&
                                        " - Rozważ upgrade"}
                                    {storagePercent >= 90 &&
                                        " - Czas na większy plan!"}
                                </p>
                            </div>
                        </div>

                        {/* Customer Portal Link - only if subscribed */}
                        {user.lemon_squeezy_customer_id &&
                            user.subscription_status === "active" && (
                                <div className="px-8 pb-6">
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <a
                                            href={`https://app.lemonsqueezy.com/my-orders`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold group transition-colors"
                                        >
                                            <Shield className="w-5 h-5" />
                                            <span>
                                                Zarządzaj subskrypcją w Lemon
                                                Squeezy
                                            </span>
                                            <svg
                                                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                        </a>
                                        <p className="text-xs text-blue-600 mt-2 ml-7">
                                            Zaktualizuj metodę płatności,
                                            zarządzaj subskrypcją lub pobierz
                                            faktury
                                        </p>
                                    </div>
                                </div>
                            )}
                    </div>
                </div>

                {/* Storage Warning */}
                {storagePercent >= 90 && (
                    <div className="mb-8">
                        <div className="bg-linear-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-red-900 mb-1">
                                        ⚠️ Brakuje miejsca na zdjęcia
                                    </h3>
                                    <p className="text-red-700 mb-3">
                                        Wykorzystałeś już{" "}
                                        <strong>
                                            {storagePercent.toFixed(0)}%
                                        </strong>{" "}
                                        dostępnego miejsca! Czas pomyśleć o
                                        uaktualnieniu planu, aby mieć więcej
                                        przestrzeni na swoje zdjęcia.
                                    </p>
                                    <button className="text-sm font-semibold text-red-800 hover:text-red-900 underline underline-offset-2">
                                        Zobacz dostępne plany ↓
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Plans Section */}
                <div className="mb-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            {user.subscription_plan === "free"
                                ? "Wybierz idealny plan dla siebie"
                                : "Zmień lub uaktualnij swój plan"}
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            {user.subscription_plan === "free"
                                ? "Rozpocznij przygodę z większą przestrzenią i dodatkowymi funkcjami"
                                : "Dostosuj plan do swoich potrzeb. Możesz zmienić go w każdej chwili."}
                        </p>
                    </div>

                    <PricingCards
                        currentPlan={user.subscription_plan}
                        userId={user.id}
                        userEmail={user.email}
                    />
                </div>

                {/* Footer Info */}
                <div className="mt-16 text-center pb-8">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <Shield className="w-4 h-4" />
                        <span>Bezpieczne płatności przez Lemon Squeezy</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Anuluj w każdej chwili. Bez ukrytych opłat.
                    </p>
                </div>
            </div>
        </div>
    );
}
