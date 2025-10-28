"use client";

import { PLANS, Plan } from "@/lib/plans";
import { Check, Sparkles, Zap, Rocket, Gift, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PricingCardsProps {
    currentPlan?: string;
    userId?: number;
    userEmail?: string;
}

const planColors = {
    free: {
        gradient: "from-gray-50 to-slate-50",
        border: "border-gray-200",
        icon: "text-gray-500",
        iconBg: "bg-gray-50",
        badge: "bg-gray-400",
        button: "bg-gray-500 hover:bg-gray-600",
        ring: "ring-gray-300",
    },
    basic: {
        gradient: "from-blue-50 to-indigo-50",
        border: "border-blue-100",
        icon: "text-blue-500",
        iconBg: "bg-blue-50",
        badge: "bg-blue-400",
        button: "bg-blue-500 hover:bg-blue-600",
        ring: "ring-blue-300",
    },
    pro: {
        gradient: "from-orange-50 to-amber-50",
        border: "border-orange-100",
        icon: "text-orange-500",
        iconBg: "bg-orange-50",
        badge: "bg-orange-400",
        button: "bg-orange-500 hover:bg-orange-600",
        ring: "ring-orange-300",
    },
    unlimited: {
        gradient: "from-emerald-50 to-teal-50",
        border: "border-emerald-100",
        icon: "text-emerald-500",
        iconBg: "bg-emerald-50",
        badge: "bg-emerald-400",
        button: "bg-emerald-500 hover:bg-emerald-600",
        ring: "ring-emerald-300",
    },
};

const planIcons = {
    free: Gift,
    basic: Sparkles,
    pro: Zap,
    unlimited: Rocket,
};

export default function PricingCards({
    currentPlan = "free",
    userId,
    userEmail,
}: PricingCardsProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleSubscribe = async (plan: Plan) => {
        if (!userId || !userEmail) {
            window.location.href = "/login";
            return;
        }

        if (!plan.lemonSqueezyVariantId) return;

        setIsLoading(plan.id);

        try {
            const response = await fetch("/api/billing/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    variantId: plan.lemonSqueezyVariantId,
                    email: userEmail,
                    userId,
                }),
            });

            const data = await response.json();

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Wystąpił błąd. Spróbuj ponownie.");
        } finally {
            setIsLoading(null);
        }
    };

    const plans = Object.values(PLANS);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto py-12">
            {plans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlan;
                const isFree = plan.id === "free";
                const colors = planColors[plan.id as keyof typeof planColors];
                const Icon =
                    planIcons[plan.id as keyof typeof planIcons] || Sparkles;

                return (
                    <div
                        key={plan.id}
                        className={`relative bg-linear-to-br ${
                            colors.gradient
                        } rounded-xl border-2 ${colors.border} ${
                            plan.popular
                                ? "lg:scale-105 shadow-xl"
                                : "shadow-md"
                        } ${
                            isCurrentPlan ? `ring-2 ${colors.ring}` : ""
                        } hover:shadow-lg transition-all duration-300 overflow-hidden`}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className="absolute top-0 right-0 bg-linear-to-r from-orange-400 to-orange-500 text-white px-4 py-1 text-xs font-bold uppercase tracking-tighter rounded-bl-lg shadow-sm">
                                Polecany
                            </div>
                        )}

                        {/* Current Plan Badge */}
                        {isCurrentPlan && (
                            <div className="absolute top-3 right-3 animate-pulse bg-emerald-400 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                                <Check size={14} />
                                Obecny plan
                            </div>
                        )}

                        <div className="p-6">
                            {/* Icon & Title */}
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className={`w-12 h-12 ${colors.iconBg} rounded-lg flex items-center justify-center`}
                                >
                                    <Icon
                                        className={`w-6 h-6 ${colors.icon}`}
                                    />
                                </div>
                                {!plan.popular && !isCurrentPlan && (
                                    <div className="w-12 h-12" />
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {plan.name}
                            </h3>

                            {/* Price */}
                            <div className="mb-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                                        {plan.price}
                                    </span>
                                    <span className="text-xl font-bold text-gray-900">
                                        zł
                                    </span>
                                    {!isFree && (
                                        <span className="text-sm text-gray-600">
                                            /mies
                                        </span>
                                    )}
                                </div>
                                {plan?.storageLabel && (
                                    <p className="text-xs text-gray-600 mt-1 font-medium flex items-center gap-1">
                                        <Star className="text-yellow-500 fill-amber-400" />{" "}
                                        <span className="text-orange-800">
                                            {plan.storageLabel}
                                        </span>
                                    </p>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-2.5 mb-6">
                                {plan.features.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-2 text-xs lg:text-sm"
                                    >
                                        <div
                                            className={`w-5 h-5 ${colors.iconBg} rounded-full flex items-center justify-center shrink-0 mt-0.5`}
                                        >
                                            <Check
                                                size={12}
                                                className={colors.icon}
                                            />
                                        </div>
                                        <span className="text-gray-700 leading-relaxed">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleSubscribe(plan)}
                                disabled={
                                    isCurrentPlan ||
                                    isFree ||
                                    isLoading === plan.id
                                }
                                className={`w-full py-3 px-4 rounded-lg font-semibold text-sm lg:text-base transition-all duration-200 ${
                                    isCurrentPlan
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : isFree
                                        ? "bg-white border-2 border-gray-300 text-gray-700 cursor-default"
                                        : `${colors.button} text-white shadow-md hover:shadow-lg transform`
                                }`}
                            >
                                {isLoading === plan.id ? (
                                    <span className="flex items-center justify-center py-1 gap-2">
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                    </span>
                                ) : isCurrentPlan ? (
                                    "Aktualny plan"
                                ) : isFree ? (
                                    "Twój plan"
                                ) : (
                                    <>
                                        Wybierz {plan.name}
                                        <span className="ml-1">→</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
