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
    username?: string;
    is_username_set?: boolean;
    provider: "email" | "google";
    subscription_plan: "free" | "basic" | "pro" | "unlimited";
    subscription_status: "active" | "cancelled" | "expired" | null;
    storage_used: number;
    storage_limit: number;
    lemon_squeezy_customer_id?: string;
    lemon_squeezy_subscription_id?: string;
    subscription_ends_at?: string | null;
}
