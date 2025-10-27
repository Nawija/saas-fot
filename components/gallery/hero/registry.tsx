// components/gallery/hero/registry.tsx
import { GalleryHeroTemplate } from "./types";
import { MinimalTemplate } from "./templates/Minimal";
import { FullscreenTemplate } from "./templates/Fullscreen";
import { SplitTemplate } from "./templates/Split";
import { OverlayTemplate } from "./templates/Overlay";
import { GradientTemplate } from "./templates/Gradient";

export const GALLERY_HERO_TEMPLATES: Record<string, GalleryHeroTemplate> = {
    minimal: MinimalTemplate,
    fullscreen: FullscreenTemplate,
    split: SplitTemplate,
    overlay: OverlayTemplate,
    gradient: GradientTemplate,
    cards: SplitTemplate,
};

export function getGalleryHeroTemplate(key?: string): GalleryHeroTemplate {
    if (!key) return MinimalTemplate;
    return GALLERY_HERO_TEMPLATES[key] || MinimalTemplate;
}
