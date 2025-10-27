"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Calendar, CreditCard, AlertCircle } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import MainButton from "../buttons/MainButton";

type Props = {
    subscription_plan: "free" | "basic" | "pro" | "unlimited";
    subscription_status: "active" | "cancelled" | "expired" | "past_due" | null;
    lemon_squeezy_subscription_id?: string;
    subscription_ends_at?: string | null;
};

function formatDate(dateStr?: string | null) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function SubscriptionSection({
    subscription_plan,
    subscription_status,
    lemon_squeezy_subscription_id,
    subscription_ends_at,
}: Props) {
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resuming, setResuming] = useState(false);

    const canManage =
        subscription_plan !== "free" && !!lemon_squeezy_subscription_id;

    async function handleCancel() {
        if (!lemon_squeezy_subscription_id) return;
        setLoading(true);
        try {
            const res = await fetch("/api/billing/cancel-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscriptionId: lemon_squeezy_subscription_id,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Błąd anulowania");
            toast.success("Subskrypcja anulowana", {
                description: "Dostęp do końca okresu rozliczeniowego",
            });
            window.location.reload();
        } catch (e: any) {
            toast.error("Nie udało się anulować subskrypcji", {
                description: e.message,
            });
        } finally {
            setLoading(false);
            setConfirmCancel(false);
        }
    }

    async function handleResume() {
        if (!lemon_squeezy_subscription_id) return;
        setResuming(true);
        try {
            const res = await fetch("/api/billing/resume-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscriptionId: lemon_squeezy_subscription_id,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Błąd wznawiania");
            toast.success("Subskrypcja wznowiona", {
                description: "Od teraz będzie się automatycznie odnawiać",
            });
            window.location.reload();
        } catch (e: any) {
            toast.error("Nie udało się wznowić subskrypcji", {
                description: e.message,
            });
        } finally {
            setResuming(false);
        }
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-semibold">Subskrypcja</h2>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-base font-semibold capitalize">
                        {subscription_status || "brak"}
                    </p>
                </div>
                <span className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-900 capitalize">
                    Plan {subscription_plan}
                </span>
            </div>

            {/* Renewal or End date */}
            {subscription_ends_at && subscription_status === "active" && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">
                            Odnowienie subskrypcji
                        </p>
                        <p className="text-base font-semibold text-blue-700">
                            {formatDate(subscription_ends_at)}
                        </p>
                    </div>
                </div>
            )}

            {subscription_ends_at && subscription_status === "cancelled" && (
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200 mb-4">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div>
                        <p className="text-sm font-medium text-orange-900">
                            Dostęp do
                        </p>
                        <p className="text-base font-semibold text-orange-700">
                            {formatDate(subscription_ends_at)}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                            Po tym terminie plan zostanie zmieniony na darmowy
                        </p>
                    </div>
                </div>
            )}

            {canManage && subscription_status === "active" && (
                <div className="flex justify-end">
                    <MainButton
                        onClick={() => setConfirmCancel(true)}
                        loading={loading}
                        loadingText="Anulowanie..."
                        variant="danger"
                        label="Anuluj subskrypcję"
                    />
                </div>
            )}

            {/* Resume button when subscription is scheduled to end but still active until then */}
            {canManage && subscription_status === "cancelled" && (
                <div className="flex justify-end">
                    <MainButton
                        onClick={handleResume}
                        loading={resuming}
                        loadingText="Wznawianie..."
                        variant="success"
                        label="Wznów subskrypcję"
                    />
                </div>
            )}

            <ConfirmDialog
                open={confirmCancel}
                onOpenChange={setConfirmCancel}
                onConfirm={handleCancel}
                title="Anulować subskrypcję?"
                description="Zachowasz dostęp do końca okresu rozliczeniowego. Możesz w każdej chwili odnowić subskrypcję."
                confirmLabel="Anuluj subskrypcję"
                cancelLabel="Zatrzymaj"
            />
        </div>
    );
}
