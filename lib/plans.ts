// Plany subskrypcji

export type SubscriptionPlan = "free" | "basic" | "pro" | "unlimited";

export interface Plan {
    id: SubscriptionPlan;
    name: string;
    price: number;
    priceMonthly: number;
    storage: number; // w bajtach
    storageLabel: string;
    features: string[];
    lemonSqueezyVariantId?: string;
    popular?: boolean;
}

// Limity storage w bajtach
const GB = 1024 * 1024 * 1024;

export const PLANS: Record<SubscriptionPlan, Plan> = {
    free: {
        id: "free",
        name: "Darmowy",
        price: 0,
        priceMonthly: 0,
        storage: 2 * GB, // 2GB
        storageLabel: "2 GB",
        features: [
            "2 GB przestrzeni",
            "Do 5 galerii",
            "Podstawowe udostępnianie",
            "Watermark na zdjęciach",
        ],
    },
    basic: {
        id: "basic",
        name: "Basic",
        price: 8,
        priceMonthly: 8,
        storage: 10 * GB, // 10GB
        storageLabel: "10 GB",
        features: [
            "10 GB przestrzeni",
            "Nielimitowane galerie",
            "Ochrona hasłem",
            "Bez watermarków",
            "Podstawowa analityka",
        ],
        lemonSqueezyVariantId: process.env.NEXT_PUBLIC_LS_VARIANT_BASIC,
    },
    pro: {
        id: "pro",
        name: "Pro",
        price: 16,
        priceMonthly: 16,
        storage: 100 * GB, // 100GB
        storageLabel: "100 GB",
        features: [
            "100 GB przestrzeni",
            "Nielimitowane galerie",
            "Ochrona hasłem",
            "Bez watermarków",
            "Zaawansowana analityka",
            "Własna domena",
            "Priorytetowe wsparcie",
        ],
        lemonSqueezyVariantId: process.env.NEXT_PUBLIC_LS_VARIANT_PRO,
        popular: true,
    },
    unlimited: {
        id: "unlimited",
        name: "Unlimited",
        price: 40,
        priceMonthly: 40,
        storage: Infinity, // Bez limitu
        storageLabel: "Nielimitowana",
        features: [
            "Nielimitowana przestrzeń",
            "Nielimitowane galerie",
            "Ochrona hasłem",
            "Bez watermarków",
            "Zaawansowana analityka",
            "Własna domena",
            "Dedykowane wsparcie 24/7",
            "API dostęp",
            "Backup automatyczny",
        ],
        lemonSqueezyVariantId: process.env.NEXT_PUBLIC_LS_VARIANT_UNLIMITED,
    },
};

/**
 * Sprawdza czy użytkownik może przesłać plik o danym rozmiarze
 */
export function canUploadFile(
    currentStorageUsed: number,
    fileSize: number,
    plan: SubscriptionPlan
): { canUpload: boolean; reason?: string } {
    const planDetails = PLANS[plan];

    if (planDetails.storage === Infinity) {
        return { canUpload: true };
    }

    const newTotal = currentStorageUsed + fileSize;

    if (newTotal > planDetails.storage) {
        const remaining = planDetails.storage - currentStorageUsed;
        return {
            canUpload: false,
            reason: `Brak miejsca. Dostępne: ${formatBytes(
                remaining
            )}, potrzebne: ${formatBytes(fileSize)}`,
        };
    }

    return { canUpload: true };
}

/**
 * Formatuje bajty na czytelny format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return "0 B";
    if (bytes === Infinity) return "Nielimitowane";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Oblicza procent wykorzystania storage
 */
export function getStorageUsagePercent(
    used: number,
    plan: SubscriptionPlan
): number {
    const planDetails = PLANS[plan];

    if (planDetails.storage === Infinity) {
        return 0;
    }

    return Math.round((used / planDetails.storage) * 100);
}
