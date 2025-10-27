// components/gallery/hero/templates/Overlay.tsx
"use client";

import { GalleryHeroTemplate } from "../types";

export const OverlayTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Back = elements.BackButton;
    return (
        <div className="relative h-screen w-full overflow-hidden">
            <div className="absolute inset-0">
                {data.image ? (
                    <img
                        src={data.image}
                        alt={data.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            {Back && <Back />}
            <div className="relative z-10 h-full flex flex-col items-center justify-end text-white px-6 pb-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow">
                        {data.name}
                    </h1>
                    {data.description && (
                        <p className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow">
                            {data.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
