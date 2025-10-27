"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Globe, Eye } from "lucide-react";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string;
    is_public: boolean;
    password_plain?: string;
    created_at: string;
    photo_count: number;
}

interface Photo {
    id: number;
    file_path: string;
    file_name: string;
    file_size: number;
    created_at: string;
}

interface Props {
    collection: Collection;
    photos: Photo[];
}

function formatFileSize(bytes: number): string {
    const numBytes = Number(bytes) || 0;
    if (!numBytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = numBytes;
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[i]}`;
}

export default function PremiumCollectionHeader({ collection, photos }: Props) {
    const router = useRouter();
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") setOrigin(window.location.origin);
    }, []);

    const galleryUrl = useMemo(
        () => `${origin}/gallery/${collection.slug}`,
        [origin, collection.slug]
    );
    const totalSize = useMemo(
        () => photos.reduce((sum, p) => sum + p.file_size, 0),
        [photos]
    );

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Back button + Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push("/dashboard/collections")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-medium">
                        Powrót
                    </span>
                </button>
                <div className="h-6 w-px bg-gray-300 hidden sm:block" />
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">
                        {collection.name}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span>
                            {collection.photo_count}{" "}
                            {collection.photo_count === 1
                                ? "zdjęcie"
                                : collection.photo_count < 5
                                ? "zdjęcia"
                                : "zdjęć"}
                        </span>
                        <span>•</span>
                        <span>{formatFileSize(totalSize)}</span>
                        <span>•</span>
                        <span>
                            {new Date(collection.created_at).toLocaleDateString(
                                "pl-PL",
                                {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                }
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: Status + Actions */}
            <div className="flex items-center gap-2">
                {/* Password Badge (if protected) */}
                {!collection.is_public && collection.password_plain && (
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="font-mono font-semibold">
                            {collection.password_plain}
                        </span>
                    </div>
                )}

                {/* Status Badge */}
                <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                    ${
                        collection.is_public
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                    }`}
                >
                    {collection.is_public ? (
                        <>
                            <Globe className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Publiczna</span>
                        </>
                    ) : (
                        <>
                            <Lock className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Chroniona</span>
                        </>
                    )}
                </div>

                {/* View Gallery Button */}
                <a
                    href={galleryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Zobacz</span>
                </a>
            </div>
        </div>
    );
}
