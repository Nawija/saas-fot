"use client";

import React from "react";
import type { Collection } from "@/types/gallery";
import { getGalleryHeroTemplate } from "@/components/gallery/hero/registry";

export interface GalleryHeroProps {
    collection: Collection;
}

export default function GalleryHero({ collection }: GalleryHeroProps) {
    const template = collection.hero_template || "minimal";
    const HeroTemplate = getGalleryHeroTemplate(template);
    const fontKey = collection.hero_font || "inter";
    const FONT_FAMILY: Record<string, string> = {
        inter: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
        playfair:
            "'Playfair Display', Georgia, Cambria, 'Times New Roman', Times, serif",
        poppins:
            "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
    };

    const ScrollIndicator = () => (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                <div className="w-1.5 h-3 bg-white rounded-full"></div>
            </div>
        </div>
    );

    return (
        <div style={{ fontFamily: FONT_FAMILY[fontKey] }}>
            {HeroTemplate({
                data: {
                    name: collection.name,
                    description: collection.description,
                    image: collection.hero_image,
                },
                elements: { ScrollIndicator },
            })}
        </div>
    );
}
