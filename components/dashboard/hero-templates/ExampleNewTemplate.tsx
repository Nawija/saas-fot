// components/dashboard/hero-templates/ExampleNewTemplate.tsx
//
// PRZYKŁAD: Jak dodać nowy szablon
// 1. Skopiuj ten plik i zmień nazwę
// 2. Dostosuj komponenty Desktop i Mobile
// 3. Dodaj do registry.tsx
//

import { HeroTemplateProps } from "./types";

export function ExampleDesktop({
    title,
    description,
    image,
}: HeroTemplateProps) {
    return (
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600">
            {/* Opcjonalny obrazek jako tło */}
            {image && (
                <img
                    src={image}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Zawartość */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                <div className="max-w-2xl text-center">
                    <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-xl text-white/90 drop-shadow">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ExampleMobile({
    title,
    description,
    image,
}: HeroTemplateProps) {
    return (
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600">
            {/* Opcjonalny obrazek jako tło */}
            {image && (
                <img
                    src={image}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Zawartość - mniejsza wersja dla mobile */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold mb-3 drop-shadow-lg">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-white/90 drop-shadow line-clamp-3">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
