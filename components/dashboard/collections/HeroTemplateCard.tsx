// components/dashboard/collections/HeroTemplateCard.tsx
"use client";

import { useEffect, useState } from "react";
import { SquarePen } from "lucide-react";

interface HeroTemplateCardProps {
    heroImage: string;
    collectionName: string;
    templateLabel: string;
    title?: string;
    description?: string;
    onEditImage: () => void;
}

export default function HeroTemplateCard({
    heroImage,
    collectionName,
    templateLabel,
    title,
    description,
    onEditImage,
}: HeroTemplateCardProps) {
    // Local cached src that appends a one-time cache-busting param whenever
    // the `heroImage` prop changes. This forces the browser to refetch the
    // updated image even if the URL (object key) itself didn't change.
    const [displaySrc, setDisplaySrc] = useState<string>(heroImage);

    useEffect(() => {
        if (!heroImage) {
            setDisplaySrc(heroImage);
            return;
        }

        try {
            // Use URL to safely set/replace the `v` query param
            const u = new URL(heroImage, window.location.href);
            u.searchParams.set("v", String(Date.now()));
            setDisplaySrc(u.toString());
        } catch (e) {
            // Fallback for non-URL strings
            setDisplaySrc(
                heroImage +
                    (heroImage.includes("?") ? "&" : "?") +
                    "v=" +
                    Date.now()
            );
        }
    }, [heroImage]);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">
                    Gallery page template
                </h2>
            </div>

            <div className="p-5">
                <div className="space-y-4">
                    {/* Template Preview */}
                    <div className="relative group rounded-lg overflow-hidden border border-transparent hover:border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md">
                        <div className="relative w-full aspect-video bg-gray-100">
                            <img
                                src={displaySrc}
                                alt={collectionName}
                                className="w-full h-full object-cover"
                            />

                            {/* top-right edit button (visible on hover/focus) */}
                            <button
                                onClick={onEditImage}
                                aria-label="Edit hero image"
                                className="absolute top-3 right-3 z-30 inline-flex items-center gap-2 rounded-full bg-white/90 text-sm font-medium px-3 py-1 shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <SquarePen size={16} />
                                <span className="hidden sm:inline">Edit</span>
                            </button>

                            {/* Bottom gradient with title/description */}
                            {(title || description) && (
                                <div className="absolute left-0 right-0 bottom-0 p-3 bg-linear-to-t from-black/80 via-black/50 to-transparent text-white">
                                    {title && (
                                        <h3 className="text-sm md:text-base font-semibold truncate">
                                            {title}
                                        </h3>
                                    )}
                                    {description && (
                                        <p className="text-xs md:text-sm text-gray-100 mt-1 line-clamp-1">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Template Name */}
                    <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">
                                Active template
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-semibold text-gray-900">
                                    {templateLabel}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
