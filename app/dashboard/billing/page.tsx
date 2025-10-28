"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/avatar";
import { PLANS, formatBytes } from "@/lib/plans";
import PricingCards from "@/components/pricing/PricingCards";
import Loading from "@/components/ui/Loading";
import {
    Sparkles,
    TrendingUp,
    Shield,
    Crown,
    Database,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

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
        return <Loading />;
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Wymagane logowanie
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Zaloguj się, aby zobaczyć opcje płatności
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
        <div className="min-h-screen ">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full mb-4">
                            <Crown className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-600">
                                Subskrypcja
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                            Zarządzaj swoim planem
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Monitoruj wykorzystanie miejsca i wybierz plan
                            idealnie dopasowany do Twoich potrzeb
                        </p>
                    </div>
                </div>
            </div>

            <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Current Plan Card */}
                <div className="mb-10">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                        {/* Plan Header */}
                        <div className="bg-linear-to-br from-orange-50 to-amber-50 px-6 py-6 border-b border-orange-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <Crown className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-orange-600 mb-1">
                                            Aktualny plan
                                        </p>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                            {currentPlan.name}
                                        </h2>
                                        {currentPlan.price > 0 ? (
                                            <p className="text-gray-700">
                                                <span className="text-xl font-semibold">
                                                    {currentPlan.price} zł
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    /miesiąc
                                                </span>
                                            </p>
                                        ) : (
                                            <p className="text-gray-600 text-sm font-medium">
                                                Plan darmowy
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-600 mb-2">
                                            Status
                                        </p>
                                        <span
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
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
                                            {user.subscription_status ===
                                            "active"
                                                ? "Aktywna"
                                                : user.subscription_status ===
                                                  "cancelled"
                                                ? "Anulowana"
                                                : "Brak"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Storage Usage Section */}
                        <div className="px-6 py-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                                    <Database className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold text-gray-900">
                                        Wykorzystanie miejsca
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        Śledź, ile przestrzeni już wykorzystałeś
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-mono text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                        {formatBytes(storageUsed)} /{" "}
                                        {formatBytes(storageLimit)}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative">
                                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner border border-gray-200">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                                            storagePercent >= 90
                                                ? "bg-linear-to-r from-red-500 via-red-600 to-red-700"
                                                : storagePercent >= 70
                                                ? "bg-linear-to-r from-yellow-400 via-yellow-500 to-orange-500"
                                                : "bg-linear-to-r bg-emerald-500 via-emerald-600 to-emerald-700"
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
                                <div className="flex items-center justify-between mt-3">
                                    <p className="text-xs font-medium text-gray-700">
                                        {storagePercent < 0.1 &&
                                        storagePercent > 0
                                            ? "< 0.1% wykorzystane"
                                            : `${storagePercent.toFixed(
                                                  1
                                              )}% wykorzystane`}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {storagePercent < 50 &&
                                            "🎉 Dużo wolnego miejsca!"}
                                        {storagePercent >= 50 &&
                                            storagePercent < 80 &&
                                            "✅ W sam raz"}
                                        {storagePercent >= 80 &&
                                            storagePercent < 90 &&
                                            "⚡ Rozważ upgrade"}
                                        {storagePercent >= 90 &&
                                            "⚠️ Czas na większy plan!"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Portal Link */}
                        {user.lemon_squeezy_customer_id &&
                            user.subscription_status === "active" && (
                                <div className="px-6 pb-6">
                                    <div className="bg-linear-to-br to-indigo-100/90 from-violet-50 rounded-lg p-4 border border-indigo-100">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                                <Shield className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                                    Portal klienta
                                                </h4>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    Zaktualizuj metodę
                                                    płatności, zarządzaj
                                                    subskrypcją lub pobierz
                                                    faktury
                                                </p>
                                                <a
                                                    href="https://app.lemonsqueezy.com/my-orders"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 text-sm font-semibold group transition-colors"
                                                >
                                                    <span>
                                                        Otwórz Lemon Squeezy
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
                                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                        />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>
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
                                        Brakuje miejsca na zdjęcia
                                    </h3>
                                    <p className="text-red-700 mb-3">
                                        Wykorzystałeś już{" "}
                                        <strong>
                                            {storagePercent.toFixed(0)}%
                                        </strong>{" "}
                                        dostępnego miejsca! Czas pomyśleć o
                                        uaktualnieniu planu, aby mieć więcej
                                        przestrzeni na swoje galerie.
                                    </p>
                                    <button
                                        onClick={() => {
                                            document
                                                .getElementById(
                                                    "pricing-section"
                                                )
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                });
                                        }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <TrendingUp className="w-4 h-4" />
                                        Zobacz dostępne plany
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Plans Section */}
                <div id="pricing-section" className="mb-10 scroll-mt-20">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            {user.subscription_plan === "free"
                                ? "Wybierz idealny plan dla siebie"
                                : "Zmień lub uaktualnij swój plan"}
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
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

                {/* Trust Section */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-7 h-7 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Bezpieczne płatności
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Wszystkie transakcje są obsługiwane przez{" "}
                            <strong>Lemon Squeezy</strong> - zaufaną platformę
                            płatności używaną przez tysiące firm na całym
                            świecie.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Anuluj w każdej chwili</span>
                            </div>
                            <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Bez ukrytych opłat</span>
                            </div>
                            <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Natychmiastowy dostęp</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
