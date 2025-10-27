// components/dashboard/hero-templates/SplitTemplate.tsx
import { HeroTemplateProps } from "./types";

export function SplitDesktop({ title, description, image }: HeroTemplateProps) {
    return (
        <div className="grid grid-cols-2 h-full">
            <div className="bg-white flex items-center justify-center">
                <div className="p-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-gray-600 text-xs">{description}</p>
                    )}
                </div>
            </div>
            <div className="relative">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                )}
            </div>
        </div>
    );
}

export function SplitMobile({ title, description, image }: HeroTemplateProps) {
    return (
        <div className="grid grid-rows-2 h-full">
            <div className="bg-white flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-gray-600 text-xs line-clamp-3">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div className="relative">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                )}
            </div>
        </div>
    );
}
