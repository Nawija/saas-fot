// components/billing/ManageSubscriptionCard.tsx
import { CreditCard, ExternalLink } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

export default function ManageSubscriptionCard() {
    return (
        <div className="bg-gray-50 border border-gray-100 p-6 md:p-8 transition-all duration-300 hover:border-gray-200">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6 text-gray-900" />
                </div>
                <div className="flex-1">
                    <h4 className="text-lg font-light text-gray-900 mb-2">
                        Manage Subscription
                    </h4>
                    <p className="text-sm font-light text-gray-500 mb-4">
                        Update payment methods, view invoices, or cancel your
                        subscription
                    </p>
                    <a
                        href="https://app.lemonsqueezy.com/my-orders"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm font-light transition-all duration-300 hover:border-gray-900 group"
                    >
                        <span>Customer Portal</span>
                        <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                </div>
            </div>
        </div>
    );
}
