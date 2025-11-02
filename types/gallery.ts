export interface Photo {
    id: number;
    file_path: string;
    thumbnail_path?: string;
    width: number;
    height: number;
    likes: number;
    isLiked: boolean;
}

export interface Collection {
    id: number;
    name: string;
    description?: string;
    hero_image?: string;
    hero_image_mobile?: string;
    hero_template?: string;
    hero_font?: string;
}
