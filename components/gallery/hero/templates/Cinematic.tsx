// components/gallery/hero/templates/Cinematic.tsx
"use client";

import { GalleryHeroTemplate } from "../types";

// Premium: Cinematic look with letterbox bars and strong typography
export const CinematicTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Scroll = elements.ScrollIndicator;
    return (
        <div className="relative h-screen w-full bg-black overflow-hidden">
            {/* Background image */}
            {data.image ? (
                <img
                    src={data.image}
                    alt={data.name}
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                />
            ) : (
                <div className="absolute inset-0 w-full h-full bg-linear-to-br from-zinc-900 to-slate-700" />
            )}

            {/* Cinematic letterbox bars */}
            <div className="absolute top-0 left-0 right-0 h-10 md:h-14 bg-black/90" />
            <div className="absolute bottom-0 left-0 right-0 h-10 md:h-14 bg-black/90" />

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/30 to-black/60" />

            {/* Centered title/description */}
            <div className="relative z-10 h-full flex items-center justify-center px-6">
                <div className="text-center text-white">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-wide mb-4">
                        {data.name}
                    </h1>
                    {data.description && (
                        <p className="text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto">
                            {data.description}
                        </p>
                    )}
                </div>
            </div>

            {Scroll && <Scroll />}
        </div>
    );
};
