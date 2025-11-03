// components/billing/CurrentPlanCard.tsx
import { Crown, CheckCircle2, AlertCircle } from "lucide-react";

interface CurrentPlanCardProps {
    planName: string;
    planPrice: number;
    subscriptionStatus: string;
}

export default function CurrentPlanCard({
    planName,
    planPrice,
    subscriptionStatus,
}: CurrentPlanCardProps) {
    return (
        <div className="bg-white border border-gray-100 overflow-hidden transition-all duration-300 hover:border-gray-200">
            <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                    {/* Plan Info */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-50 flex items-center justify-center shrink-0 transition-colors duration-300 hover:bg-gray-100">
                            <Crown className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                            <p className="text-xs font-light text-gray-500 uppercase tracking-wider mb-1">
                                Current Plan
                            </p>
                            <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">
                                {planName}
                            </h2>
                            {planPrice > 0 ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-light text-gray-900">
                                        ${planPrice}
                                    </span>
                                    <span className="text-sm font-light text-gray-500">
                                        /month
                                    </span>
                                </div>
                            ) : (
                                <p className="text-gray-600 font-light">
                                    Free Forever
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-2">
                        <p className="text-xs font-light text-gray-500 uppercase tracking-wider">
                            Status
                        </p>
                        <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-light transition-all duration-300 ${
                                subscriptionStatus === "active"
                                    ? "bg-gray-900 text-white"
                                    : subscriptionStatus === "cancelled"
                                    ? "bg-red-50 text-red-900 border border-red-100"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            {subscriptionStatus === "active" ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                                <AlertCircle className="w-3.5 h-3.5" />
                            )}
                            {subscriptionStatus === "active"
                                ? "Active"
                                : subscriptionStatus === "cancelled"
                                ? "Cancelled"
                                : "Inactive"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
