export interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string;
    hero_image_mobile?: string;
    hero_image_position_x?: number;
    hero_image_position_y?: number;
    is_public: boolean;
    password_plain?: string;
    photo_count?: number;
    created_at: string;
}

export interface CollectionFormData {
    name: string;
    description?: string;
    is_public: boolean;
    password?: string;
}

export interface CollectionStats {
    total_collections: number;
    total_photos: number;
    storage_used: number;
}
