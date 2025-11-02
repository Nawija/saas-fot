// components/gallery/hero/types.ts

export interface GalleryHeroData {
    name: string;
    description?: string;
    image?: string;
    imageMobile?: string;
}

export interface GalleryHeroElements {
    BackButton?: () => React.ReactNode | null;
    ScrollIndicator?: () => React.ReactNode | null;
}

export interface GalleryHeroOptions {
    disableAnimations?: boolean;
}

export type GalleryHeroTemplate = (ctx: {
    data: GalleryHeroData;
    elements: GalleryHeroElements;
    options?: GalleryHeroOptions;
}) => React.ReactNode;
