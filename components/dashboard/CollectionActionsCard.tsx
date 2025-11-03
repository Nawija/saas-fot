import { Download, Globe, Lock } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

interface CollectionActionsCardProps {
    isPublic: boolean;
    photosCount: number;
    onDownloadAll: () => void;
    onOpenSettings: () => void;
}

export default function CollectionActionsCard({
    isPublic,
    photosCount,
    onDownloadAll,
    onOpenSettings,
}: CollectionActionsCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-light text-gray-900">Actions</h2>
            </div>
            <div className="p-6 space-y-2">
                <MainButton
                    onClick={onDownloadAll}
                    icon={<Download className="w-4 h-4" />}
                    label="Download ZIP"
                    variant="secondary"
                    className="w-full"
                    disabled={photosCount === 0}
                />
                <MainButton
                    onClick={onOpenSettings}
                    icon={
                        isPublic ? (
                            <Globe className="w-4 h-4" />
                        ) : (
                            <Lock className="w-4 h-4" />
                        )
                    }
                    label="Settings"
                    variant="secondary"
                    className="w-full"
                />
            </div>
        </div>
    );
}
