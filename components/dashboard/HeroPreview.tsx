// components/dashboard/HeroPreview.tsx
"use client";

interface HeroPreviewProps {
    selectedTemplate: string;
    previewTab: "landing" | "photos";
    collectionName: string;
    collectionDescription?: string;
    heroImage?: string;
}

export default function HeroPreview({
    selectedTemplate,
    previewTab,
    collectionName,
    collectionDescription,
    heroImage,
}: HeroPreviewProps) {
    const renderTemplate = (
        tpl: string,
        title: string,
        desc: string | undefined,
        img: string | undefined,
        isPhotos: boolean
    ) => {
        switch (tpl) {
            case "fullscreen":
                return (
                    <div className="absolute inset-0">
                        {img ? (
                            <img
                                src={img}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
                        )}
                        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-black/60" />
                        <div className="absolute inset-0 flex items-center justify-center text-white px-6">
                            <div className="text-center">
                                <h1 className="text-3xl font-extrabold mb-1">
                                    {title}
                                </h1>
                                {desc && (
                                    <p className="text-sm text-gray-200">
                                        {desc}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case "split":
                return (
                    <div className="grid grid-cols-2 h-full">
                        <div className="bg-white flex items-center justify-center">
                            <div className="p-6 text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    {title}
                                </h1>
                                {desc && (
                                    <p className="text-gray-600 text-xs">
                                        {desc}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            {img ? (
                                <img
                                    src={img}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                            )}
                        </div>
                    </div>
                );

            case "overlay":
                return (
                    <div className="absolute inset-0">
                        {img ? (
                            <img
                                src={img}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white px-6">
                            <h1 className="text-2xl font-bold mb-1">{title}</h1>
                            {desc && (
                                <p className="text-gray-200 text-xs">{desc}</p>
                            )}
                        </div>
                    </div>
                );

            case "gradient":
                return (
                    <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-slate-800 to-gray-700">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                                {img ? (
                                    <img
                                        src={img}
                                        alt={title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-slate-600 to-slate-400" />
                                )}
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.5))]" />
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white px-6">
                            <h1 className="text-2xl font-extrabold mb-1">
                                {title}
                            </h1>
                            {desc && (
                                <p className="text-gray-200 text-xs">{desc}</p>
                            )}
                        </div>
                    </div>
                );

            case "cards":
                return (
                    <div className="grid grid-cols-2 h-full">
                        <div className="bg-white flex items-center justify-center">
                            <div className="p-6 text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    {title}
                                </h1>
                                {desc && (
                                    <p className="text-gray-600 text-xs">
                                        {desc}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-100 grid grid-cols-3 gap-1 p-2">
                            <div className="bg-white" />
                            <div className="bg-white" />
                            <div className="bg-white" />
                        </div>
                    </div>
                );

            case "minimal":
            default:
                return (
                    <div className="absolute inset-0">
                        {img ? (
                            <img
                                src={img}
                                alt={title}
                                className="w-full h-full object-cover opacity-60"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-800" />
                        )}
                        <div className="absolute inset-0 bg-black/60" />
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                            <h1 className="text-3xl font-bold">{title}</h1>
                        </div>
                    </div>
                );
        }
    };

    const renderMobileTemplate = (
        tpl: string,
        title: string,
        desc: string | undefined,
        img: string | undefined
    ) => {
        switch (tpl) {
            case "fullscreen":
                return (
                    <div className="absolute inset-0">
                        {img ? (
                            <img
                                src={img}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
                        )}
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center text-white px-4">
                            <div className="text-center">
                                <h1 className="text-2xl font-extrabold mb-1">
                                    {title}
                                </h1>
                                {desc && (
                                    <p className="text-xs text-gray-200 line-clamp-3">
                                        {desc}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case "split":
                return (
                    <div className="grid grid-rows-2 h-full">
                        <div className="bg-white flex items-center justify-center p-4">
                            <div className="text-center">
                                <h1 className="text-xl font-bold text-gray-900 mb-1">
                                    {title}
                                </h1>
                                {desc && (
                                    <p className="text-gray-600 text-xs line-clamp-3">
                                        {desc}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            {img ? (
                                <img
                                    src={img}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                            )}
                        </div>
                    </div>
                );

            case "overlay":
                return (
                    <div className="absolute inset-0">
                        {img ? (
                            <img
                                src={img}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white px-4">
                            <h1 className="text-xl font-bold mb-1">{title}</h1>
                            {desc && (
                                <p className="text-gray-200 text-xs line-clamp-2">
                                    {desc}
                                </p>
                            )}
                        </div>
                    </div>
                );

            case "gradient":
                return (
                    <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-slate-800 to-gray-700">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                                {img ? (
                                    <img
                                        src={img}
                                        alt={title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-slate-600 to-slate-400" />
                                )}
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.5))]" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white px-4">
                            <h1 className="text-xl font-extrabold mb-1">
                                {title}
                            </h1>
                            {desc && (
                                <p className="text-gray-200 text-xs line-clamp-2">
                                    {desc}
                                </p>
                            )}
                        </div>
                    </div>
                );

            case "cards":
                return (
                    <div className="grid grid-rows-2 h-full">
                        <div className="bg-white flex items-center justify-center p-4">
                            <div className="text-center">
                                <h1 className="text-xl font-bold text-gray-900 mb-1">
                                    {title}
                                </h1>
                                {desc && (
                                    <p className="text-gray-600 text-xs line-clamp-3">
                                        {desc}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-100 grid grid-cols-3 gap-1 p-2">
                            <div className="bg-white h-20" />
                            <div className="bg-white h-20" />
                            <div className="bg-white h-20" />
                        </div>
                    </div>
                );

            case "minimal":
            default:
                return (
                    <div className="absolute inset-0">
                        {img ? (
                            <img
                                src={img}
                                alt={title}
                                className="w-full h-full object-cover opacity-60"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-800" />
                        )}
                        <div className="absolute inset-0 bg-black/60" />
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                            <h1 className="text-2xl font-bold">{title}</h1>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="mt-6">
            {/* Desktop preview */}
            <div className="relative w-[90%] mx-auto mb-8">
                <div className="p-3 rounded-lg border border-gray-200 w-full shadow-xl bg-black">
                    <div className="aspect-video p-3 relative">
                        {renderTemplate(
                            selectedTemplate,
                            collectionName,
                            collectionDescription,
                            heroImage,
                            previewTab === "photos"
                        )}
                    </div>
                </div>

                {/* Mobile preview (positioned absolutely) */}
                <div className="absolute z-10 -bottom-2 -right-8 w-[200px] h-[420px] rounded-4xl border-8 border-black overflow-hidden shadow-xl bg-black">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 rounded-full bg-black/60 z-20" />
                    <div className="absolute inset-0">
                        {renderMobileTemplate(
                            selectedTemplate,
                            collectionName,
                            collectionDescription,
                            heroImage
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
