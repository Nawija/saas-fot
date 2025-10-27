import { HeroTemplateDefinition } from "./types";
import { MinimalDesktop, MinimalMobile } from "./MinimalTemplate";
import { FullscreenDesktop, FullscreenMobile } from "./FullscreenTemplate";

export const HERO_TEMPLATES: HeroTemplateDefinition[] = [
    {
        key: "minimal",
        label: "Minimal",
        Desktop: MinimalDesktop,
        Mobile: MinimalMobile,
    },
    {
        key: "fullscreen",
        label: "Pełny ekran",
        Desktop: FullscreenDesktop,
        Mobile: FullscreenMobile,
    },
];

// Helper do łatwego pobierania szablonu po kluczu
export function getTemplateByKey(key: string): HeroTemplateDefinition {
    return (
        HERO_TEMPLATES.find((t) => t.key === key) || HERO_TEMPLATES[0] // fallback na minimal
    );
}
