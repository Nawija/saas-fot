// components/gallery/hero/templates/Editorial.tsx
"use client";

import { GalleryHeroTemplate } from "../types";

// Premium: Editorial (magazine) layout with translucent panel
export const EditorialTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Scroll = elements.ScrollIndicator;
    return (
        <div
            className="relative w-full overflow-hidden"
            style={{ height: "100dvh" }}
        >
            {/* Background image */}
            {data.image ? (
                <img
                    src={data.image}
                    alt={data.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
            )}

            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.55))]" />

            {/* Editorial panel */}
            <div className="relative z-10 h-full flex items-center">
                <div className="w-full px-6">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        <div className="backdrop-blur-sm bg-white/75 border border-white/50 shadow-xl rounded-2xl p-6 md:p-8">
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
                                {data.name}
                            </h1>
                            {data.description && (
                                <p className="text-base md:text-lg text-gray-700">
                                    {data.description}
                                </p>
                            )}
                        </div>
                        {/* Placeholder column for breathing space on desktop */}
                        <div className="hidden md:block" />
                    </div>
                </div>
            </div>

            {Scroll && <Scroll />}
        </div>
    );
};
