import crypto from "crypto";

interface LemonSqueezyWebhookPayload {
    meta: {
        event_name: string;
        custom_data?: {
            user_id?: string;
        };
    };
    data: {
        id: string;
        attributes: {
            customer_id: number;
            subscription_id?: number;
            product_id: number;
            variant_id: number;
            status: string;
            ends_at?: string | null;
            [key: string]: any;
        };
    };
}

/**
 * Weryfikuje sygnaturę webhooka Lemon Squeezy
 */
export function verifyLemonSqueezySignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Mapuje variant_id Lemon Squeezy na plan
 */
export function mapVariantToPlan(variantId: string): string {
    const mapping: Record<string, string> = {
        [process.env.NEXT_PUBLIC_LS_VARIANT_BASIC || ""]: "basic",
        [process.env.NEXT_PUBLIC_LS_VARIANT_PRO || ""]: "pro",
        [process.env.NEXT_PUBLIC_LS_VARIANT_UNLIMITED || ""]: "unlimited",
    };

    return mapping[variantId] || "free";
}

/**
 * Mapuje plan na limit storage
 */
export function getPlanStorageLimit(plan: string): number {
    const GB = 1024 * 1024 * 1024;

    const limits: Record<string, number> = {
        free: 2 * GB,
        basic: 10 * GB,
        pro: 100 * GB,
        unlimited: Number.MAX_SAFE_INTEGER, // Praktycznie nieograniczone
    };

    return limits[plan] || limits.free;
}

/**
 * Generuje URL checkout Lemon Squeezy
 */
export function generateCheckoutUrl(
    variantId: string,
    email: string,
    userId: number
): string {
    const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;

    // Format URL: https://twój-store.lemonsqueezy.com/checkout/buy/variant-id
    // Możesz też użyć bezpośredniego URL jeśli masz własną domenę
    const baseUrl = `https://${storeId}.lemonsqueezy.com/checkout/buy/${variantId}`;

    const params = new URLSearchParams({
        checkout: JSON.stringify({
            email,
            custom: JSON.stringify({
                user_id: userId.toString(),
            }),
        }),
    });

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Tworzy portal zarządzania subskrypcją
 */
export async function createCustomerPortalUrl(
    customerId: string
): Promise<string> {
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

    const response = await fetch(
        `https://api.lemonsqueezy.com/v1/customers/${customerId}/portal`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create customer portal");
    }

    const data = await response.json();
    return data.data.attributes.url;
}
