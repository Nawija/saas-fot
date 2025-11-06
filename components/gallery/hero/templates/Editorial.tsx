// components/gallery/hero/templates/Editorial.tsx
"use client";

import ResponsiveHeroImage from "../ResponsiveHeroImage";
import { GalleryHeroTemplate } from "../types";

// Premium: Editorial (magazine) layout with translucent panel
export const EditorialTemplate: GalleryHeroTemplate = ({ data }) => {
    return (
        <div
            className="relative w-full overflow-hidden"
            style={{ height: "100dvh" }}
        >
            {/* Background image */}
            {data.image ? (
                <ResponsiveHeroImage
                    desktop={data.image}
                    mobile={data.imageMobile}
                    alt={data.name}
                    className="object-cover absolute left-0 top-0 -z-10"
                    priority
                />
            ) : (
                <div className="absolute inset-0 w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
            )}

            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.55))]" />

            {/* Editorial panel */}
            <div className="absolute bottom-6 left-0">
                <div className="w-full px-6">
                    <div className="max-w-xl mx-auto gap-6 md:gap-10">
                        <div className="backdrop-blur-md bg-black/10 shadow-2xl rounded p-6 md:p-8">
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
                                {data.name}
                            </h1>
                            {data.description && (
                                <p className="text-base md:text-lg text-gray-100 leading-relaxed">
                                    {data.description}
                                </p>
                            )}
                        </div>
                        {/* Placeholder column for breathing space on desktop */}
                        <div className="hidden md:block" />
                    </div>
                </div>
            </div>
        </div>
    );
};
