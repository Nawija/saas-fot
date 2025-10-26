"use client";

import { PLANS, Plan } from "@/lib/plans";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PricingCardsProps {
    currentPlan?: string;
    userId?: number;
    userEmail?: string;
}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlan;
                const isFree = plan.id === "free";

                return (
                    <div
                        key={plan.id}
                        className={`relative bg-white rounded-2xl shadow-lg p-6 border-2 transition-all hover:shadow-xl ${
                            plan.popular
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-200"
                        } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/3 transform -translate-x-1/2">
                                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                    Najpopularniejszy
                                </span>
                            </div>
                        )}

                        {isCurrentPlan && (
                            <div className="absolute -top-4 right-4">
                                <span className="bg-green-300 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                    Aktywny
                                </span>
                            </div>
                        )}

                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold mb-2">
                                {plan.name}
                            </h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold">
                                    ${plan.price}
                                </span>
                                {!isFree && (
                                    <span className="text-gray-500">
                                        /miesiąc
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {plan.storageLabel} miejsca
                            </p>
                        </div>

                        <ul className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <Check
                                        size={18}
                                        className="text-green-500 shrink-0 mt-0.5"
                                    />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe(plan)}
                            disabled={
                                isCurrentPlan || isFree || isLoading === plan.id
                            }
                            className={`w-full py-3 rounded-lg font-semibold transition ${
                                isCurrentPlan
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : isFree
                                    ? "bg-gray-100 text-gray-600 cursor-default"
                                    : plan.popular
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-900 text-white hover:bg-gray-800"
                            }`}
                        >
                            {isLoading === plan.id
                                ? "Przekierowywanie..."
                                : isCurrentPlan
                                ? "Obecny plan"
                                : isFree
                                ? "Darmowy"
                                : "Wybierz plan"}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
