// components/gallery/hero/templates/Fullscreen.tsx
"use client";

import { GalleryHeroTemplate } from "../types";

export const FullscreenTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Back = elements.BackButton;
    const Scroll = elements.ScrollIndicator;
    return (
        <div className="relative h-screen w-full overflow-hidden">
            {data.image ? (
                <img
                    src={data.image}
                    alt={data.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-black/60" />
            {Back && <Back />}
            <div className="absolute inset-0 flex items-center justify-center text-white px-6">
                <div className="text-center">
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6">
                        {data.name}
                    </h1>
                    {data.description && (
                        <p className="text-2xl md:text-3xl text-gray-200 mb-10 max-w-4xl mx-auto">
                            {data.description}
                        </p>
                    )}
                </div>
            </div>
            {Scroll && <Scroll />}
        </div>
    );
};
