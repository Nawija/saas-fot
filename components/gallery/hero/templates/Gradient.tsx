// components/gallery/hero/templates/Gradient.tsx
"use client";

import { GalleryHeroTemplate } from "../types";

export const GradientTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Back = elements.BackButton;
    return (
        <div className="relative h-screen w-full bg-linear-to-br from-gray-900 via-slate-800 to-gray-700 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    {data.image ? (
                        <img
                            src={data.image}
                            alt={data.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-slate-600 to-slate-400" />
                    )}
                </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.5))]" />
            {Back && <Back />}
            <div className="relative z-10 h-full flex flex-col items-center justify-end text-white px-6 pb-16">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow">
                        {data.name}
                    </h1>
                    {data.description && (
                        <p className="text-lg md:text-2xl text-gray-200 mb-8 drop-shadow">
                            {data.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
