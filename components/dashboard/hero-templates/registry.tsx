import { HeroTemplateDefinition, HeroTemplateProps } from "./types";
import type { GalleryHeroTemplate } from "@/components/gallery/hero/types";
import { HERO_TEMPLATE_SOURCE } from "@/components/gallery/hero/registry";

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

// Build HERO_TEMPLATES by wrapping each tpl from the gallery source.
export const HERO_TEMPLATES: HeroTemplateDefinition[] =
    HERO_TEMPLATE_SOURCE.map(({ key, label, tpl, premium }) => {
        const { Desktop, Mobile } = wrapTemplate(tpl);
        return { key, label, Desktop, Mobile, premium };
    });

// Lista kluczy premium do importu w backendzie
export const PREMIUM_TEMPLATES = HERO_TEMPLATES.filter((t) => t.premium).map(
    (t) => t.key
);
export const ALLOWED_TEMPLATES = HERO_TEMPLATES.map((t) => t.key);

// Helper to easily get a template by key
export function getTemplateByKey(key: string): HeroTemplateDefinition {
    return HERO_TEMPLATES.find((t) => t.key === key) || HERO_TEMPLATES[0];
}
