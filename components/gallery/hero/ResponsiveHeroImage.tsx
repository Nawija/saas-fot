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
        <>
            {/* Mobile Image - wyświetlane tylko na małych ekranach */}
            <div className="md:hidden absolute inset-0">
                <img
                    src={mobileImage}
                    alt={alt}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    className={`w-full h-full object-cover ${className}`}
                />
            </div>

            {/* Desktop Image - wyświetlane tylko na dużych ekranach */}
            <div className="hidden md:block absolute inset-0">
                <img
                    src={desktop}
                    alt={alt}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    className={`w-full h-full object-cover ${className}`}
                />
            </div>
        </>
    );
}
