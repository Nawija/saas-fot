// components/gallery/hero/templates/Minimal.tsx
"use client";

import Image from "next/image";
import { GalleryHeroTemplate } from "../types";

export const MinimalTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Scroll = elements.ScrollIndicator;
    return (
        <div className="relative h-screen w-full bg-neutral-950 overflow-hidden">
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
                    <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black/70" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-linear-to-br from-neutral-900 via-neutral-950 to-black" />
            )}

            {/* Decorative Lines */}
            <div className="absolute top-0 left-0 w-20 md:w-32 h-0.5 bg-white/30 z-10" />
            <div className="absolute bottom-0 right-0 w-20 md:w-32 h-0.5 bg-white/30 z-10" />
            <div className="absolute top-0 left-0 w-0.5 h-20 md:h-32 bg-white/30 z-10" />
            <div className="absolute bottom-0 right-0 w-0.5 h-20 md:h-32 bg-white/30 z-10" />

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
                        href="#s"
                        className="group relative inline-flex items-center justify-center px-10 md:px-12 py-4 md:py-5 bg-white text-black font-semibold text-base md:text-lg overflow-hidden hover:bg-neutral-100 active:scale-[0.99] transition-all duration-200"
                    >
                        <span className="relative z-10">Zobacz galerię</span>
                        <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </a>
                </div>
            </div>

            {/* Scroll Indicator */}
            {Scroll && <Scroll />}
        </div>
    );
};
