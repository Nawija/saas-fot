import { HeroTemplateDefinition, HeroTemplateProps } from "./types";
import { MinimalTemplate } from "@/components/gallery/hero/templates/Minimal";
import { FullscreenTemplate } from "@/components/gallery/hero/templates/Fullscreen";
import { SplitTemplate } from "@/components/gallery/hero/templates/Split";
import { OverlayTemplate } from "@/components/gallery/hero/templates/Overlay";
import { GradientTemplate } from "@/components/gallery/hero/templates/Gradient";
import { GalleryHeroTemplate } from "@/components/gallery/hero/types";

// Adapter: wrap gallery hero templates (single responsive component via slot API)
// into the dashboard creator's expected Desktop/Mobile components.

function wrapTemplate(tpl: GalleryHeroTemplate) {
    const Desktop = ({ title, description, image }: HeroTemplateProps) => {
        return (
            <>
                <div className="hero-preview-scope relative w-full h-full overflow-hidden">
                    {tpl({
                        data: { name: title, description, image },
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
    const Mobile = ({ title, description, image }: HeroTemplateProps) => {
        return (
            <>
                <div className="hero-preview-scope relative w-full h-full overflow-hidden">
                    {tpl({
                        data: { name: title, description, image },
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

const SOURCE: Array<{ key: string; label: string; tpl: GalleryHeroTemplate }> =
    [
        { key: "minimal", label: "Minimal", tpl: MinimalTemplate },
        { key: "fullscreen", label: "Pełny ekran", tpl: FullscreenTemplate },
        { key: "split", label: "Podział", tpl: SplitTemplate },
        { key: "overlay", label: "Overlay", tpl: OverlayTemplate },
        { key: "gradient", label: "Gradient", tpl: GradientTemplate },
        // Alias
        { key: "cards", label: "Karty", tpl: SplitTemplate },
    ];

export const HERO_TEMPLATES: HeroTemplateDefinition[] = SOURCE.map(
    ({ key, label, tpl }) => {
        const { Desktop, Mobile } = wrapTemplate(tpl);
        return { key, label, Desktop, Mobile };
    }
);

// Helper do łatwego pobierania szablonu po kluczu
export function getTemplateByKey(key: string): HeroTemplateDefinition {
    return (
        HERO_TEMPLATES.find((t) => t.key === key) || HERO_TEMPLATES[0] // fallback na minimal
    );
}
