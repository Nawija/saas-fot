// components/gallery/hero/templates/Minimal.tsx
"use client";

import Image from "next/image";
import { GalleryHeroTemplate } from "../types";

export const MinimalTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Scroll = elements.ScrollIndicator;
    return (
        <div className="relative h-screen w-full bg-black overflow-hidden">
            {/* Background Image */}
            {data.image ? (
                <div className="absolute inset-0">
                    <Image
                        src={data.image}
                        alt={data.name}
                        quality={100}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/30 to-black/40" />
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
            <div className="absolute inset-0 flex items-center justify-center z-20 px-4 md:px-8">
                <div className="text-center max-w-4xl w-full">
                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-tight tracking-tight">
                        {data.name}
                    </h1>

                    {/* Description */}
                    {data.description && (
                        <p className="text-base md:text-lg lg:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {data.description}
                        </p>
                    )}

                    {/* CTA Button */}
                    <a
                        href="#gallery"
                        className="group relative inline-flex items-center justify-center px-10 py-3 border border-gray-200 hover:bg-gray-300 text-gray-300 font-semibold text-base md:text-lg overflow-hidden hover:text-gray-800 transition-all duration-200"
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
