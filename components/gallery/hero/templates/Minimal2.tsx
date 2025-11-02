// components/gallery/hero/templates/Minimal.tsx
"use client";

import { GalleryHeroTemplate } from "../types";
import { ArrowBigDown } from "lucide-react";
import ResponsiveHeroImage from "../ResponsiveHeroImage";

export const MinimalTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Scroll = elements.ScrollIndicator;
    return (
        <div className="relative h-screen w-full bg-neutral-950 overflow-hidden">
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
                    <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black/70" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-linear-to-br from-neutral-900 via-neutral-950 to-black" />
            )}

            {/* Decorative Corner Lines */}
            {/* Top Left */}
            <div className="absolute top-0 left-0 z-10">
                <div className="w-16 md:w-24 lg:w-32 h-px bg-white/40" />
                <div className="w-px h-16 md:h-24 lg:h-32 bg-white/40" />
            </div>

            {/* Top Right */}
            <div className="absolute top-0 right-0 z-10">
                <div className="ml-auto w-16 md:w-24 lg:w-32 h-px bg-white/40" />
                <div className="ml-auto w-px h-16 md:h-24 lg:h-32 bg-white/40" />
            </div>

            {/* Bottom Left */}
            <div className="absolute bottom-0 left-0 z-10">
                <div
                    className="w-px h-16 md:h-24 lg:h-32 bg-white/40 mb-0 translate-y-full"
                    style={{ transform: "translateY(-100%)" }}
                />
                <div className="w-16 md:w-24 lg:w-32 h-px bg-white/40" />
            </div>

            {/* Bottom Right */}
            <div className="absolute bottom-0 right-0 z-10">
                <div
                    className="ml-auto w-px h-16 md:h-24 lg:h-32 bg-white/40"
                    style={{ transform: "translateY(-100%)" }}
                />
                <div className="ml-auto w-16 md:w-24 lg:w-32 h-px bg-white/40" />
            </div>

            {/* Center Decorative Lines */}
            <div className="absolute top-1/2 left-8 md:left-16 w-8 md:w-12 h-px bg-white/20 z-10" />
            <div className="absolute top-1/2 right-8 md:right-16 w-8 md:w-12 h-px bg-white/20 z-10" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center z-20 px-6 md:px-12 lg:px-16">
                <div className="text-center max-w-4xl w-full">
                    {/* Small Badge */}
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-white/10 border border-white/20 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 bg-white" />
                        <span className="text-white/70 text-xs uppercase tracking-[0.2em] font-medium">
                            Galeria
                        </span>
                    </div>
                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-[1.1] tracking-tight">
                        {data.name}
                    </h1>
                    {/* Decorative Divider */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-8 h-px bg-white/30" />
                        <div className="w-1.5 h-1.5 bg-white/50" />
                        <div className="w-8 h-px bg-white/30" />
                    </div>
                    {/* Description */}
                    {data.description && (
                        <p className="text-base md:text-lg lg:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {data.description}
                        </p>
                    )}{" "}
                    {/* CTA Button */}
                    <a
                        href="#gallery"
                        className="group relative inline-flex items-center justify-center px-10 md:px-12 py-4 md:py-5 bg-white text-black font-semibold text-base md:text-lg overflow-hidden hover:bg-neutral-100 active:scale-[0.99] transition-all duration-200"
                    >
                        <span className="relative z-10">Zobacz galerię</span>
                        <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </a>
                </div>
            </div>

            <ArrowBigDown />
        </div>
    );
};
