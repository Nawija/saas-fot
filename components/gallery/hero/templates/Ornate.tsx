// components/gallery/hero/templates/PremiumOrnate.tsx
"use client";

import { GalleryHeroTemplate } from "../types";
import ResponsiveHeroImage from "../ResponsiveHeroImage";

export const OrnateTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Scroll = elements.ScrollIndicator;
    return (
        <div
            className="relative w-full overflow-hidden"
            style={{ height: "100dvh" }}
        >
            {/* Background image */}
            {data.image ? (
                <div className="absolute inset-0 -z-10">
                    <ResponsiveHeroImage
                        desktop={data.image}
                        mobile={data.imageMobile || data.image}
                        alt={data.name}
                        className="w-full h-full object-cover opacity-95"
                        priority
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.6) 70%)",
                        }}
                    />
                </div>
            ) : (
                <div
                    className="absolute inset-0 -z-10"
                    style={{ background: "#0b1020" }}
                />
            )}

            {/* Ornate corner accents */}
            <svg
                className="absolute top-6 left-6 w-28 h-28 text-white/6"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="20" cy="20" r="40" fill="rgba(255,255,255,0.03)" />
            </svg>
            <svg
                className="absolute bottom-6 right-6 w-40 h-40 text-indigo-500/6"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    rx="18"
                    fill="rgba(99,102,241,0.03)"
                />
            </svg>

            {/* Left decorative vertical line */}
            <div className="absolute left-8 top-16 bottom-16 w-0.5 bg-white/10" />

            {/* Content layout: left text, right floating glass card */}
            <div className="absolute inset-0 z-20 flex items-center md:justify-between px-6 text-center md:text-left md:px-16 flex-col md:flex-row justify-center gap-10">
                <div className="max-w-2xl order-1 md:order-0">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight">
                        {data.name}
                    </h1>
                    {data.description && (
                        <p className="mt-6 text-base md:text-lg text-white/85 max-w-lg leading-relaxed">
                            {data.description}
                        </p>
                    )}
                    <div className="mt-8 flex gap-4">
                        <a
                            className="px-5 py-3 bg-white text-gray-900 rounded-md font-medium shadow"
                            href="#gallery"
                        >
                            Przeglądaj
                        </a>
                    </div>
                </div>

                <div className="md:block max-w-sm w-full">
                    <div className="bg-white/6 backdrop-blur-sm border border-white/6 rounded-md p-6 shadow-2xl">
                        <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                            {data.image && (
                                <ResponsiveHeroImage
                                    desktop={data.image}
                                    mobile={data.imageMobile || data.image}
                                    alt={data.name}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <h1 className="text-xl lg:text-2xl font-semibold text-white leading-tight">
                            {data.name}
                        </h1>
                        {data.description && (
                            <p className="mt-6 text-base md:text-lg text-white/85 max-w-lg leading-relaxed">
                                {data.description}
                            </p>
                        )}
                        <div className="mt-4 flex items-center justify-between text-xs text-white/70">
                            <span>2025</span>
                        </div>
                    </div>
                </div>
            </div>

            {Scroll && <Scroll />}
        </div>
    );
};

export default OrnateTemplate;
