// components/dashboard/hero-templates/types.ts

export interface HeroTemplateProps {
    title: string;
    description?: string;
    image?: string;
    imagePositionX?: number;
    imagePositionY?: number;
}

export interface HeroTemplateDefinition {
    key: string;
    label: string;
    Desktop: React.ComponentType<HeroTemplateProps>;
    Mobile: React.ComponentType<HeroTemplateProps>;
    premium?: boolean; // Czy szablon jest dostępny tylko dla subskrybentów
}
