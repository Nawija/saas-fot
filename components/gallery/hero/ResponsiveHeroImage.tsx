// components/gallery/hero/ResponsiveHeroImage.tsx
"use client";

interface ResponsiveHeroImageProps {
    desktop: string;
    mobile?: string;
    alt: string;
    className?: string;
    priority?: boolean;
}

export default function ResponsiveHeroImage({
    desktop,
    mobile,
    alt,
    className = "",
    priority = true,
}: ResponsiveHeroImageProps) {
    // Jeśli nie ma mobile version, użyj desktop dla wszystkich
    const mobileImage = mobile || desktop;

    return (
        <picture className="absolute inset-0 w-full h-full -z-10">
            {/* Mobile Image - optymalizowana dla portrait */}
            {mobile && (
                <source
                    media="(max-width: 767px)"
                    srcSet={mobileImage}
                    type="image/webp"
                />
            )}

            {/* Desktop Image - optymalizowana dla landscape */}
            <img
                src={desktop}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={priority ? "high" : "auto"}
                className={`w-full h-full -z-10 ${className}`}
                style={{
                    objectFit: "cover",
                    objectPosition: "center",
                }}
            />
        </picture>
    );
}
