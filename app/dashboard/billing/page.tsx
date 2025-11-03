"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/avatar";
import { PLANS } from "@/lib/plans";
import PricingCards from "@/components/pricing/PricingCards";
import Loading from "@/components/ui/Loading";
import CurrentPlanCard from "@/components/billing/CurrentPlanCard";
import StorageUsageCard from "@/components/billing/StorageUsageCard";
import ManageSubscriptionCard from "@/components/billing/ManageSubscriptionCard";
import StorageWarningAlert from "@/components/billing/StorageWarningAlert";
import { CreditCard } from "lucide-react";

export default function BillingPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

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
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center max-w-md px-6">
                    <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="w-8 h-8 text-gray-900" />
                    </div>
                    <h2 className="text-2xl font-light text-gray-900 mb-2">
                        Authentication Required
                    </h2>
                    <p className="text-sm font-light text-gray-500">
                        Please sign in to manage your subscription
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

    return (
        <div className="min-h-screen bg-white">
            <div className="border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="max-w-2xl">
                        <p className="text-xs font-light text-gray-500 uppercase tracking-wider mb-4">
                            Billing & Subscription
                        </p>
                        <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-3">
                            Manage Your Plan
                        </h1>
                        <p className="text-base font-light text-gray-600">
                            Monitor storage usage and upgrade your subscription
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="space-y-6 md:space-y-8">
                    <CurrentPlanCard
                        planName={currentPlan.name}
                        planPrice={currentPlan.price}
                        subscriptionStatus={user.subscription_status || "free"}
                    />

                    <StorageUsageCard
                        storageUsed={storageUsed}
                        storageLimit={storageLimit}
                    />

                    {user.lemon_squeezy_customer_id &&
                        user.subscription_status === "active" && (
                            <ManageSubscriptionCard />
                        )}

                    <StorageWarningAlert storagePercent={storagePercent} />

                    <div id="plans" className="pt-8 md:pt-12 scroll-mt-8">
                        <div className="text-center mb-8 md:mb-12">
                            <p className="text-xs font-light text-gray-500 uppercase tracking-wider mb-3">
                                Available Plans
                            </p>
                            <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-3">
                                {user.subscription_plan === "free"
                                    ? "Choose Your Plan"
                                    : "Upgrade Your Plan"}
                            </h2>
                            <p className="text-base font-light text-gray-600 max-w-2xl mx-auto">
                                {user.subscription_plan === "free"
                                    ? "Select the plan that fits your needs"
                                    : "Change or upgrade anytime"}
                            </p>
                        </div>

                        <PricingCards
                            currentPlan={user.subscription_plan || "free"}
                            userId={user.id || 0}
                            userEmail={user.email || ""}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
