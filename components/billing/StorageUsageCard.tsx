// components/billing/StorageUsageCard.tsx
import { Database } from "lucide-react";
import { formatBytes } from "@/lib/plans";

interface StorageUsageCardProps {
    storageUsed: number;
    storageLimit: number;
}

export default function StorageUsageCard({
    storageUsed,
    storageLimit,
}: StorageUsageCardProps) {
    const storagePercent =
        storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;
    const visualPercent = Math.max(
        storagePercent,
        storagePercent > 0 ? 0.5 : 0
    );

    const getStatusColor = () => {
        if (storagePercent >= 90) return "bg-gray-900";
        if (storagePercent >= 70) return "bg-gray-700";
        return "bg-gray-500";
    };

    const getStatusText = () => {
        if (storagePercent < 50) return "Plenty of space";
        if (storagePercent < 80) return "Looking good";
        if (storagePercent < 90) return "Consider upgrading";
        return "Almost full";
    };

    return (
        <div className="bg-white border border-gray-100 p-6 md:p-8 transition-all duration-300 hover:border-gray-200">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 flex items-center justify-center shrink-0 transition-colors duration-300 hover:bg-gray-100">
                    <Database className="w-6 h-6 text-gray-900" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-light text-gray-900 mb-1">
                        Storage Usage
                    </h3>
                    <p className="text-sm font-light text-gray-500">
                        {formatBytes(storageUsed)} of{" "}
                        {formatBytes(storageLimit)} used
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
                <div className="w-full bg-gray-100 h-2 overflow-hidden transition-all duration-300">
                    <div
                        className={`h-full transition-all duration-700 ease-out ${getStatusColor()}`}
                        style={{
                            width: `${Math.min(visualPercent, 100)}%`,
                        }}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-light text-gray-900">
                        {storagePercent < 0.1 && storagePercent > 0
                            ? "< 0.1%"
                            : `${storagePercent.toFixed(1)}%`}
                    </p>
                    <p className="text-sm font-light text-gray-500">
                        {getStatusText()}
                    </p>
                </div>
            </div>
        </div>
    );
}
