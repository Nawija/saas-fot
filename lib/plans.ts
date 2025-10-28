// Plany subskrypcji

export type SubscriptionPlan = "free" | "basic" | "pro" | "unlimited";

export interface Plan {
    id: SubscriptionPlan;
    name: string;
    price: number;
    priceMonthly: number;
    storage: number; // w bajtach
    storageLabel: string;
    maxCollections: number; // maksymalna liczba galerii
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
        storageLabel: "",
        maxCollections: 3, // Limit 3 galerii
        features: [
            "2 GB przestrzeni (1000+ zdjęć)",
            "Do 3 galerii",
            "Zdjecia do 1300px",
            "Publiczne linki do galerii",
            "Watermark na zdjęciach",
            "Automatyczny konwert WebP",
            "Pobieranie zdjęć z watermarkiem",
        ],
    },
    basic: {
        id: "basic",
        name: "Basic",
        price: 8,
        priceMonthly: 8,
        storage: 10 * GB, // 10GB
        storageLabel: "Szablony Premium",
        maxCollections: 20, // Limit 20 galerii
        features: [
            "10 GB przestrzeni",
            "Do 20 galerii",
            "Szablony Premium",
            "Zdjecia do 1920px",
            "Publiczne linki do galerii",
            "Prywatne linki z ochroną hasłem",
            "Brak Watermark na zdjęciach",
            "Automatyczny konwert WebP",
            "Pobieranie zdjęć bez watermark",
        ],
        lemonSqueezyVariantId: process.env.NEXT_PUBLIC_LS_VARIANT_BASIC,
    },
    pro: {
        id: "pro",
        name: "Pro",
        price: 16,
        priceMonthly: 16,
        storage: 100 * GB, // 100GB
        storageLabel: "Szablony Premium",
        maxCollections: Infinity, // Nielimitowane
        features: [
            "100 GB przestrzeni",
            "Nielimitowane galerie",
            "Szablony Galerii Premium",
            "Zdjecia do 2400px",
            "Publiczne linki do galerii",
            "Prywatne linki z ochroną hasłem",
            "Brak Watermark na zdjęciach",
            "Automatyczny konwert WebP/PNG",
            "Pobieranie zdjęć bez watermark",
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
        storageLabel: "Szablony Premium",
        maxCollections: Infinity, // Nielimitowane
        features: [
            "Nielimitowana przestrzeń",
            "Nielimitowane galerie",
            "Szablony Galerii Premium",
            "Zdjecia do 3000px",
            "Publiczne linki do galerii",
            "Prywatne linki z ochroną hasłem",
            "Brak Watermark na zdjęciach",
            "Automatyczny konwert WebP/PNG",
            "Pobieranie zdjęć bez watermark",
            "Priorytetowe wsparcie",
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
    // Zabezpieczenie przed NaN, undefined, null
    if (!bytes || isNaN(bytes) || bytes === 0) return "0 B";
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
