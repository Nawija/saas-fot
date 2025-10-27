// components/dashboard/hero-templates/OverlayTemplate.tsx
import { HeroTemplateProps } from "./types";

export function OverlayDesktop({
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
                <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white px-6">
                <h1 className="text-2xl font-bold mb-1">{title}</h1>
                {description && (
                    <p className="text-gray-200 text-xs">{description}</p>
                )}
            </div>
        </div>
    );
}

export function OverlayMobile({
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
                <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white px-4">
                <h1 className="text-xl font-bold mb-1">{title}</h1>
                {description && (
                    <p className="text-gray-200 text-xs line-clamp-2">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
