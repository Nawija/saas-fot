// components/dashboard/collections/CollectionStats.tsx
interface CollectionStatsProps {
    photosCount: number;
    totalSize: number;
    createdAt: string;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export default function CollectionStats({
    photosCount,
    totalSize,
    createdAt,
}: CollectionStatsProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">Stats</h2>
            </div>
            <div className="p-5 space-y-3">
                <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">
                        Number of photos
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                        {photosCount}
                    </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Size</span>
                    <span className="text-sm font-semibold text-gray-900">
                        {formatFileSize(totalSize)}
                    </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Created on</span>
                    <span className="text-sm font-semibold text-gray-900">
                        {new Date(createdAt).toLocaleDateString("en-US")}
                    </span>
                </div>
            </div>
        </div>
    );
}
