// components/dashboard/hero-templates/registry.tsx
/**
 * REJESTR HERO TEMPLATES
 *
 * Aby dodać nowy szablon:
 * 1. Stwórz nowy plik np. MyTemplate.tsx z komponentami MyDesktop i MyMobile
 * 2. Zaimportuj je tutaj
 * 3. Dodaj do tablicy HERO_TEMPLATES poniżej
 *
 * Przykład:
 * import { MyDesktop, MyMobile } from "./MyTemplate";
 *
 * export const HERO_TEMPLATES = [
 *   ...
 *   {
 *     key: "my-template",
 *     label: "Mój Szablon",
 *     Desktop: MyDesktop,
 *     Mobile: MyMobile,
 *   },
 * ];
 */

import { HeroTemplateDefinition } from "./types";
import { MinimalDesktop, MinimalMobile } from "./MinimalTemplate";
import { FullscreenDesktop, FullscreenMobile } from "./FullscreenTemplate";
import { SplitDesktop, SplitMobile } from "./SplitTemplate";
import { OverlayDesktop, OverlayMobile } from "./OverlayTemplate";
import { GradientDesktop, GradientMobile } from "./GradientTemplate";

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
    {
        key: "split",
        label: "Podział 50/50",
        Desktop: SplitDesktop,
        Mobile: SplitMobile,
    },
    {
        key: "overlay",
        label: "Overlay",
        Desktop: OverlayDesktop,
        Mobile: OverlayMobile,
    },
    {
        key: "gradient",
        label: "Gradient",
        Desktop: GradientDesktop,
        Mobile: GradientMobile,
    },
];

// Helper do łatwego pobierania szablonu po kluczu
export function getTemplateByKey(key: string): HeroTemplateDefinition {
    return (
        HERO_TEMPLATES.find((t) => t.key === key) || HERO_TEMPLATES[0] // fallback na minimal
    );
}
