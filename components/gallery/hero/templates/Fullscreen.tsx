// components/gallery/hero/templates/FullScreen.tsx
"use client";

import { GalleryHeroTemplate } from "../types";
import { ArrowBigDown } from "lucide-react";
import Link from "next/link";
import ResponsiveHeroImage from "../ResponsiveHeroImage";

export const FullscreenTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    return (
        <div
            className="relative w-full bg-neutral-950 overflow-hidden"
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
                    <Link
                        href="#gallery"
                        className="group relative inline-flex items-center justify-center px-8 md:px-12 py-3 border border-white/60 text-white/90 text-base md:text-lg overflow-hidden hover:bg-white/10 transition-color duration-200"
                    >
                        <span className="relative z-10">Zobacz galerię</span>
                    </Link>
                </div>
            </div>

            <ArrowBigDown />
        </div>
    );
};
