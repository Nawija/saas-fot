// components/dashboard/collections/CollectionStats.tsx
import type { Photo } from "./types";

interface CollectionStatsProps {
    photosCount: number;
    totalSize: number;
    createdAt: string;
    likedPhotos?: (Photo & { likeCount?: number })[];
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
    likedPhotos = [],
}: CollectionStatsProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">Stats</h2>
            </div>
            <div className="p-5 space-y-3 divide-y divide-gray-100">
                <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">
                        Number of photos
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                        {photosCount}
                    </span>
                </div>
                <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-600">Liked photos</span>
                    <span className="text-sm font-semibold text-gray-900">
                        {likedPhotos.length}
                    </span>
                </div>
                <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-600">Size</span>
                    <span className="text-sm font-semibold text-gray-900">
                        {formatFileSize(totalSize)}
                    </span>
                </div>
                <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-600">Created on</span>
                    <span className="text-sm font-semibold text-gray-900">
                        {new Date(createdAt).toLocaleDateString("en-US")}
                    </span>
                </div>
            </div>
        </div>
    );
}
