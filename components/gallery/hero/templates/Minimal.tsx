// components/gallery/hero/templates/Minimal.tsx
"use client";

import Image from "next/image";
import { GalleryHeroTemplate } from "../types";

export const MinimalTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Scroll = elements.ScrollIndicator;
    return (
        <div className="relative h-screen w-full bg-black overflow-hidden">
            {data.image ? (
                <Image
                    src={data.image}
                    alt={data.name}
                    quality={100}
                    fill
                    className="object-cover"
                />
            ) : (
                <div className="w-full h-full bg-black" />
            )}

            <div className="absolute top-1/2 -translate-y-1/2 text-center left-1/2 -translate-x-1/2 p-8 text-white z-10">
                <div className="mx-auto max-w-xl mb-6">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        {data.name}
                    </h1>
                    {data.description && (
                        <p className="text-lg text-gray-200 max-w-80 mx-auto">
                            {data.description}
                        </p>
                    )}
                </div>
                <a
                    href="#s"
                    className="inline-block w-max mt-4 px-6 py-3 bg-white text-gray-600 hover:opacity-80 font-semibold transition"
                >
                    Zobacz galerię
                </a>
            </div>
            {Scroll && <Scroll />}
            <div className="absolute w-1/3 h-px bg-white top-24 left-0 z-10" />
            <div className="absolute w-1/3 h-px bg-white bottom-24 right-0 z-10" />
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/30 to-black/70" />
        </div>
    );
};
