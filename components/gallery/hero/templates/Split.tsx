// components/gallery/hero/templates/Split.tsx
"use client";

import { GalleryHeroTemplate } from "../types";

export const SplitTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Back = elements.BackButton;
    return (
        <div className="relative h-screen w-full grid grid-cols-1 md:grid-cols-2">
            <div className="relative order-2 md:order-1 flex items-center justify-center p-10 bg-white">
                <div className="max-w-lg">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                        {data.name}
                    </h1>
                    {data.description && (
                        <p className="text-lg md:text-xl text-gray-600">
                            {data.description}
                        </p>
                    )}
                </div>
            </div>
            <div className="relative order-1 md:order-2">
                {data.image ? (
                    <img
                        src={data.image}
                        alt={data.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                )}
                {Back && <Back />}
            </div>
        </div>
    );
};
