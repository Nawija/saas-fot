// Plany subskrypcji

// Subscription plans

export type SubscriptionPlan = "free" | "basic" | "pro" | "unlimited";

export interface Plan {
    id: SubscriptionPlan;
    name: string;
    price: number;
    priceMonthly: number;
    storage: number; // in bytes
    storageLabel: string;
    maxCollections: number; // maximum number of galleries
    features: string[];
    lemonSqueezyVariantId?: string;
    popular?: boolean;
}

// Storage limits in bytes
const GB = 1024 * 1024 * 1024;

export const PLANS: Record<SubscriptionPlan, Plan> = {
    free: {
        id: "free",
        name: "Free",
        price: 0,
        priceMonthly: 0,
        storage: 2 * GB, // 2GB
        storageLabel: "",
        maxCollections: 3, // Limit 3 galleries
        features: [
            "2 GB storage (1000+ photos)",
            "Up to 3 galleries",
            "Photos up to 1300px",
            "Public gallery links",
            "Watermark on photos",
            "Automatic WebP conversion",
            "ZIP download with watermark",
        ],
    },
    basic: {
        id: "basic",
        name: "Basic",
        price: 8,
        priceMonthly: 8,
        storage: 10 * GB, // 10GB
        storageLabel: "Premium templates",
        maxCollections: 20, // Limit 20 galleries
        features: [
            "10 GB storage",
            "Up to 20 galleries",
            "Premium templates",
            "Photos up to 1920px",
            "Public gallery links",
            "Private links with password protection",
            "No watermark on photos",
            "Automatic WebP conversion",
            "ZIP download without watermark",
        ],
        lemonSqueezyVariantId: process.env.NEXT_PUBLIC_LS_VARIANT_BASIC,
    },
    pro: {
        id: "pro",
        name: "Pro",
        price: 16,
        priceMonthly: 16,
        storage: 100 * GB, // 100GB
        storageLabel: "Premium templates",
        maxCollections: Infinity, // Unlimited
        features: [
            "100 GB storage",
            "Unlimited galleries",
            "Premium Gallery Templates",
            "Photos up to 2400px",
            "Public gallery links",
            "Private links with password protection",
            "No watermark on photos",
            "Automatic WebP/PNG conversion",
            "ZIP download without watermark",
            "Priority support",
        ],
        lemonSqueezyVariantId: process.env.NEXT_PUBLIC_LS_VARIANT_PRO,
        popular: true,
    },
    unlimited: {
        id: "unlimited",
        name: "Unlimited",
        price: 40,
        priceMonthly: 40,
        storage: Infinity, // No limit
        storageLabel: "Premium templates",
        maxCollections: Infinity, // Unlimited
        features: [
            "Unlimited storage",
            "Unlimited galleries",
            "Premium Gallery Templates",
            "Photos up to 3000px",
            "Public gallery links",
            "Private links with password protection",
            "No watermark on photos",
            "Automatic WebP/PNG conversion",
            "ZIP download without watermark",
            "Priority support",
        ],
        lemonSqueezyVariantId: process.env.NEXT_PUBLIC_LS_VARIANT_UNLIMITED,
    },
};

/**
 * Checks if the user can upload a file of a given size
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
            reason: `Out of space. Available: ${formatBytes(
                remaining
            )}, needed: ${formatBytes(fileSize)}`,
        };
    }

    return { canUpload: true };
}

/**
 * Formats bytes into a readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    // Guard against NaN, undefined, null
    if (!bytes || isNaN(bytes) || bytes === 0) return "0 B";
    if (bytes === Infinity) return "Unlimited";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Calculates percent of storage used
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
