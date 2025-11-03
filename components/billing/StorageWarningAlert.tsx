// components/billing/StorageWarningAlert.tsx
import { AlertCircle } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

interface StorageWarningAlertProps {
    storagePercent: number;
}

export default function StorageWarningAlert({
    storagePercent,
}: StorageWarningAlertProps) {
    if (storagePercent < 90) return null;

    const scrollToPlans = () => {
        document.getElementById("plans")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return (
        <div className="bg-white border border-gray-900 p-6 md:p-8 transition-all duration-300">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-900 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-light text-gray-900 mb-2">
                        Storage Almost Full
                    </h3>
                    <p className="text-sm font-light text-gray-600 mb-4">
                        You've used {storagePercent.toFixed(0)}% of your
                        storage. Upgrade now to continue uploading photos.
                    </p>
                    <MainButton
                        label="View Plans"
                        variant="primary"
                        onClick={scrollToPlans}
                    />
                </div>
            </div>
        </div>
    );
}
