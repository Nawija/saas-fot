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

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center z-20 px-6 md:px-12 lg:px-16">
                <div className="text-center max-w-4xl w-full">
                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white mb-6 leading-[1.1] tracking-tight">
                        {data.name}
                    </h1>
                    {/* Decorative Divider */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-[15vw] h-px bg-white/60" />
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        <div className="w-[15vw] h-px bg-white/60" />
                    </div>
                    {/* Description */}
                    {data.description && (
                        <p className="text-base md:text-lg font-semibold text-white mb-10 max-w-2xl mx-auto leading-relaxed">
                            {data.description}
                        </p>
                    )}{" "}
                    {/* CTA Button */}
                    <Link
                        href="#gallery"
                        className="group relative inline-flex items-center justify-center px-8 md:px-12 py-3 border border-white/40 rounded text-white bg-black/50 text-base md:text-lg overflow-hidden hover:bg-white/10 transition-color duration-200"
                    >
                        <span className="relative z-10">Zobacz galerię</span>
                    </Link>
                </div>
            </div>

            <ArrowBigDown />
        </div>
    );
};
