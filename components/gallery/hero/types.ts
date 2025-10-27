// components/gallery/hero/types.ts

export interface GalleryHeroData {
    name: string;
    description?: string;
    image?: string;
}

export interface GalleryHeroElements {
    BackButton?: () => React.ReactNode | null;
    ScrollIndicator?: () => React.ReactNode | null;
}

export type GalleryHeroTemplate = (ctx: {
    data: GalleryHeroData;
    elements: GalleryHeroElements;
}) => React.ReactNode;
