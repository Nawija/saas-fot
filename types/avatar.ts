// Typy dla zarządzania awatarami

export interface AvatarUploadResponse {
    ok: boolean;
    avatarUrl?: string;
    message: string;
    error?: string;
}

export interface ProcessedImage {
    buffer: Buffer;
    contentType: string;
    size: number;
}

export interface R2Config {
    endpoint: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    publicDomain: string;
}

export interface User {
    id: number;
    email: string;
    name?: string;
    avatar?: string;
    provider: "email" | "google";
}
