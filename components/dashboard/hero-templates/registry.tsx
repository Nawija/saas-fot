import { HeroTemplateDefinition, HeroTemplateProps } from "./types";
import { MinimalTemplate } from "@/components/gallery/hero/templates/Minimal";
import { FullscreenTemplate } from "@/components/gallery/hero/templates/Fullscreen";
import { SplitTemplate } from "@/components/gallery/hero/templates/Split";
import { OverlayTemplate } from "@/components/gallery/hero/templates/Overlay";
import { GradientTemplate } from "@/components/gallery/hero/templates/Gradient";
import { CinematicTemplate } from "@/components/gallery/hero/templates/Cinematic";
import { EditorialTemplate } from "@/components/gallery/hero/templates/Editorial";
import { GalleryHeroTemplate } from "@/components/gallery/hero/types";

// Adapter: wrap gallery hero templates (single responsive component via slot API)
// into the dashboard creator's expected Desktop/Mobile components.

function wrapTemplate(tpl: GalleryHeroTemplate) {
    const Desktop = ({
        title,
        description,
        image,
        imagePositionX = 50,
        imagePositionY = 50,
    }: HeroTemplateProps) => {
        return (
            <>
                <div className="hero-preview-scope relative w-full h-full overflow-hidden">
                    {tpl({
                        data: {
                            name: title,
                            description,
                            image,
                            imagePositionX,
                            imagePositionY,
                        },
                        elements: {},
                    })}
                </div>
                <style jsx global>{`
                    /* Force viewport-based heights to fit preview frame */
                    .hero-preview-scope .h-screen {
                        height: 100% !important;
                    }
                    .hero-preview-scope .min-h-screen {
                        min-height: 100% !important;
                    }
                `}</style>
            </>
        );
    };
    const Mobile = ({
        title,
        description,
        image,
        imagePositionX = 50,
        imagePositionY = 50,
    }: HeroTemplateProps) => {
        return (
            <>
                <div className="hero-preview-scope relative w-full h-full overflow-hidden">
                    {tpl({
                        data: {
                            name: title,
                            description,
                            image,
                            imagePositionX,
                            imagePositionY,
                        },
                        elements: {},
                    })}
                </div>
                <style jsx global>{`
                    .hero-preview-scope .h-screen {
                        height: 100% !important;
                    }
                    .hero-preview-scope .min-h-screen {
                        min-height: 100% !important;
                    }
                `}</style>
            </>
        );
    };
    return { Desktop, Mobile } as const;
}

const SOURCE: Array<{
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

export const HERO_TEMPLATES: HeroTemplateDefinition[] = SOURCE.map(
    ({ key, label, tpl, premium }) => {
        const { Desktop, Mobile } = wrapTemplate(tpl);
        return { key, label, Desktop, Mobile, premium };
    }
);

// Lista kluczy premium do importu w backendzie
export const PREMIUM_TEMPLATES = HERO_TEMPLATES.filter((t) => t.premium).map(
    (t) => t.key
);
export const ALLOWED_TEMPLATES = HERO_TEMPLATES.map((t) => t.key);

// Helper to easily get a template by key
export function getTemplateByKey(key: string): HeroTemplateDefinition {
    return (
        HERO_TEMPLATES.find((t) => t.key === key) || HERO_TEMPLATES[0] // fallback to minimal
    );
}
