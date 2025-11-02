// components/gallery/hero/ResponsiveHeroImage.tsx
"use client";

import Image from "next/image";

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
                <Image
                    src={mobileImage}
                    alt={alt}
                    quality={75}
                    fill
                    className={className}
                    priority={priority}
                    sizes="100vw"
                />
            </div>

            {/* Desktop Image - wyświetlane tylko na dużych ekranach */}
            <div className="hidden md:block absolute inset-0">
                <Image
                    src={desktop}
                    alt={alt}
                    quality={75}
                    fill
                    className={className}
                    priority={priority}
                    sizes="100vw"
                />
            </div>
        </>
    );
}
