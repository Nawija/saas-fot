// components/gallery/hero/registry.tsx
import { GalleryHeroTemplate } from "./types";
import { MinimalTemplate } from "./templates/Minimal";
import { FullscreenTemplate } from "./templates/Fullscreen";
import { SplitTemplate } from "./templates/Split";
import { OverlayTemplate } from "./templates/Overlay";
import { GradientTemplate } from "./templates/Gradient";
import { CinematicTemplate } from "./templates/Cinematic";
import { EditorialTemplate } from "./templates/Editorial";

// Single source-of-truth for available gallery hero templates.
// Dashboard registry will import `HERO_TEMPLATE_SOURCE` and wrap each tpl
// into Desktop/Mobile preview components there.
export const HERO_TEMPLATE_SOURCE: Array<{
    key: string;
    label: string;
    tpl: GalleryHeroTemplate;
    premium?: boolean;
}> = [
    { key: "minimal", label: "Minimal", tpl: MinimalTemplate },
    { key: "fullscreen", label: "Fullscreen", tpl: FullscreenTemplate },
    { key: "split", label: "Split", tpl: SplitTemplate, premium: true },
    { key: "overlay", label: "Overlay", tpl: OverlayTemplate },
    { key: "gradient", label: "Gradient", tpl: GradientTemplate },
    {
        key: "cinematic",
        label: "Cinematic",
        tpl: CinematicTemplate,
        premium: true,
    },
    {
        key: "editorial",
        label: "Editorial",
        tpl: EditorialTemplate,
        premium: true,
    },
];

export const GALLERY_HERO_TEMPLATES: Record<string, GalleryHeroTemplate> =
    HERO_TEMPLATE_SOURCE.reduce((acc, item) => {
        acc[item.key] = item.tpl;
        // keep 'cards' alias mapped to SplitTemplate for backward compatibility
        if (item.key === "split") acc["cards"] = item.tpl;
        return acc;
    }, {} as Record<string, GalleryHeroTemplate>);

export function getGalleryHeroTemplate(key?: string): GalleryHeroTemplate {
    if (!key) return MinimalTemplate;
    return GALLERY_HERO_TEMPLATES[key] || MinimalTemplate;
}
