// components/dashboard/hero-templates/FullscreenTemplate.tsx
import { HeroTemplateProps } from "./types";

export function FullscreenDesktop({
    title,
    description,
    image,
}: HeroTemplateProps) {
    return (
        <div className="absolute inset-0">
            {image ? (
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-black/60" />
            <div className="absolute inset-0 flex items-center justify-center text-white px-6">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold mb-1">{title}</h1>
                    {description && (
                        <p className="text-sm text-gray-200">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export function FullscreenMobile({
    title,
    description,
    image,
}: HeroTemplateProps) {
    return (
        <div className="absolute inset-0">
            {image ? (
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center text-white px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold mb-1">{title}</h1>
                    {description && (
                        <p className="text-xs text-gray-200 line-clamp-3">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
