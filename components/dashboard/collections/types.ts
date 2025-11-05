// components/dashboard/collections/types.ts

export interface Collection {
    id: number;
    name: string;
    slug: string;
    description: string;
    hero_image: string;
    hero_template?: string;
    hero_font?: string;
    is_public: boolean;
    password_plain?: string;
    subdomain?: string;
    created_at: string;
    photo_count: number;
}

export interface Photo {
    id: number;
    file_path: string;
    file_name: string;
    file_size: number;
    width?: number;
    height?: number;
    created_at: string;
}

export interface UploadError {
    fileName: string;
    originalSize: string;
    compressedSize?: string;
    reason: string;
}

export interface UpgradeContext {
    title: string;
    description: string;
    feature: string;
}
