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

    const plan = mapping[variantId] || "free";

    console.log(`[mapVariantToPlan] Variant ID: ${variantId} -> Plan: ${plan}`);
    console.log(`[mapVariantToPlan] Available mappings:`, {
        basic: process.env.NEXT_PUBLIC_LS_VARIANT_BASIC,
        pro: process.env.NEXT_PUBLIC_LS_VARIANT_PRO,
        unlimited: process.env.NEXT_PUBLIC_LS_VARIANT_UNLIMITED,
    });

    return plan;
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
 * Tworzy checkout przez API Lemon Squeezy (zawsze działa, nie wymaga subdomeny)
 */
export async function generateCheckoutUrl(
    variantId: string,
    email: string,
    userId: string | number,
    name?: string
): Promise<string> {
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!apiKey || !storeId) {
        throw new Error("Brak LEMON_SQUEEZY_API_KEY lub STORE_ID");
    }

    try {
        const response = await fetch(
            "https://api.lemonsqueezy.com/v1/checkouts",
            {
                method: "POST",
                headers: {
                    Accept: "application/vnd.api+json",
                    "Content-Type": "application/vnd.api+json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    data: {
                        type: "checkouts",
                        attributes: {
                            // Redirect back to dashboard after successful purchase
                            product_options: appUrl
                                ? {
                                      redirect_url: `${appUrl}/dashboard/billing`,
                                  }
                                : undefined,
                            checkout_data: {
                                email,
                                // Force customer name in checkout to avoid stale/cached value
                                ...(name ? { name } : {}),
                                custom: {
                                    user_id: userId.toString(),
                                },
                            },
                        },
                        relationships: {
                            store: {
                                data: {
                                    type: "stores",
                                    id: storeId,
                                },
                            },
                            variant: {
                                data: {
                                    type: "variants",
                                    id: variantId,
                                },
                            },
                        },
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("Lemon Squeezy API error:", error);
            throw new Error(
                `Nie udało się utworzyć checkoutu: ${response.status}`
            );
        }

        const data = await response.json();
        return data.data.attributes.url;
    } catch (error) {
        console.error("Error creating checkout:", error);
        throw error;
    }
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
