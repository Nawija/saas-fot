// components/dashboard/hero-templates/GradientTemplate.tsx
import { HeroTemplateProps } from "./types";

export function GradientDesktop({
    title,
    description,
    image,
}: HeroTemplateProps) {
    return (
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-slate-800 to-gray-700">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                    {image ? (
                        <img
                            src={image}
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
                <h1 className="text-2xl font-extrabold mb-1">{title}</h1>
                {description && (
                    <p className="text-gray-200 text-xs">{description}</p>
                )}
            </div>
        </div>
    );
}

export function GradientMobile({
    title,
    description,
    image,
}: HeroTemplateProps) {
    return (
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-slate-800 to-gray-700">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                    {image ? (
                        <img
                            src={image}
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
                <h1 className="text-xl font-extrabold mb-1">{title}</h1>
                {description && (
                    <p className="text-gray-200 text-xs line-clamp-2">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
