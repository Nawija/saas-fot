// components/gallery/hero/templates/Minimal.tsx
"use client";

import { GalleryHeroTemplate } from "../types";
import ResponsiveHeroImage from "../ResponsiveHeroImage";

export const MinimalTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Scroll = elements.ScrollIndicator;
    return (
        <div
            className="relative w-full bg-black overflow-hidden"
            style={{ height: "100dvh" }}
        >
            {/* Background Image */}
            {data.image ? (
                <div className="absolute inset-0">
                    <ResponsiveHeroImage
                        desktop={data.image}
                        mobile={data.imageMobile}
                        alt={data.name}
                        className="object-cover"
                        priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-black/10" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-black" />
            )}

            {/* Decorative Lines */}
            <div className="absolute top-6 left-6 w-20 md:w-32 h-0.5 bg-white/30 z-10" />
            <div className="absolute bottom-6 right-6 w-20 md:w-32 h-0.5 bg-white/30 z-10" />
            <div className="absolute top-6 left-6 w-0.5 h-20 md:h-32 bg-white/30 z-10" />
            <div className="absolute bottom-6 right-6 w-0.5 h-20 md:h-32 bg-white/30 z-10" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center z-20 px-8">
                <div className="text-center max-w-xl w-full">
                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-tight tracking-tight">
                        {data.name}
                    </h1>

                    {/* Description */}
                    {data.description && (
                        <p className="text-base md:text-lg lg:text-xl text-white/90 mb-10 max-w-xl mx-auto leading-relaxed px-8">
                            {data.description}
                        </p>
                    )}

                    {/* CTA Button */}
                    <a
                        href="#gallery"
                        className="group relative inline-flex items-center text-sm justify-center px-8 py-3 border border-gray-200 hover:bg-gray-200 text-gray-600 bg-gray-50 font-semibold overflow-hidden hover:text-gray-800 transition-all duration-200"
                    >
                        <span className="relative z-10">Zobacz galerię</span>
                    </a>
                </div>
            </div>

            {/* Scroll Indicator */}
            {Scroll && <Scroll />}
        </div>
    );
};
