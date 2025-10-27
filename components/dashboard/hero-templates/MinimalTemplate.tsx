// components/dashboard/hero-templates/MinimalTemplate.tsx
import { HeroTemplateProps } from "./types";

export function MinimalDesktop({
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

export function MinimalMobile({
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
