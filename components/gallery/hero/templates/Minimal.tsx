// components/gallery/hero/templates/Minimal.tsx
"use client";

import { GalleryHeroTemplate } from "../types";

export const MinimalTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Back = elements.BackButton;
    const Scroll = elements.ScrollIndicator;
    return (
        <div className="relative h-screen bg-gray-900 overflow-hidden">
            {data.image ? (
                <img
                    src={data.image}
                    alt={data.name}
                    className="w-full h-full object-cover opacity-60"
                />
            ) : (
                <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-zinc-900/80" />
            {Back && <Back />}
            <div className="absolute top-1/2 -translate-y-1/2 text-center left-1/2 -translate-x-1/2 p-8 text-white">
                <div className="container mx-auto max-w-7xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-3">
                        {data.name}
                    </h1>
                    {data.description && (
                        <p className="text-xl text-gray-200">
                            {data.description}
                        </p>
                    )}
                </div>
            </div>
            {Scroll && <Scroll />}
        </div>
    );
};
