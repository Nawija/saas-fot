"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Globe } from "lucide-react";

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

export default function PremiumCollectionHeader({ collection, photos }: Props) {
    const router = useRouter();

    return (
        <div className="flex tems-center justify-between gap-4">
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
                </div>
            </div>

            {/* Right: Status + Actions */}
            <div className="flex items-center gap-2">
                {/* Password Badge (if protected) */}
                {!collection.is_public && collection.password_plain && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="font-mono font-semibold">
                            {collection.password_plain}
                        </span>
                    </div>
                )}

                {/* Status Badge */}
                <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 md:py-1 rounded-full text-xs font-semibold
                    ${
                        collection.is_public
                            ? "bg-green-100 text-green-800"
                            : "border-amber-200 text-amber-800 text-xs border bg-amber-50"
                    }`}
                >
                    {collection.is_public ? (
                        <>
                            <Globe className="w-3.5 h-3.5" />
                            <span className="inline">Publiczna</span>
                        </>
                    ) : (
                        <>
                            <Lock className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Chroniona</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
