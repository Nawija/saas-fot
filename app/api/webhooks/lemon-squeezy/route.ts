import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import {
    verifyLemonSqueezySignature,
    mapVariantToPlan,
    getPlanStorageLimit,
} from "@/lib/lemonSqueezy";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get("x-signature");
        const rawBody = await req.text();

        if (!signature) {
            return createErrorResponse("Missing signature", 401);
        }

        // Weryfikacja sygnatury
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;
        const isValid = verifyLemonSqueezySignature(rawBody, signature, secret);

        if (!isValid) {
            return createErrorResponse("Invalid signature", 401);
        }

        const payload = JSON.parse(rawBody);
        const eventName = payload.meta.event_name;

        console.log(
            `[Webhook ${eventName}] Received payload:`,
            JSON.stringify(payload, null, 2)
        );

        // Zapisz webhook do bazy
        await query(
            `INSERT INTO lemon_squeezy_webhooks (event_name, payload, processed) 
             VALUES ($1, $2, false)`,
            [eventName, payload]
        );

        const data = payload.data.attributes;
        const subscriptionId = payload.data.id;

        // Pobierz user_id z custom_data (przekazane podczas checkout)
        let userId = payload.meta.custom_data?.user_id;

        // Jeśli nie ma custom_data, spróbuj znaleźć użytkownika po customer_id
        if (!userId) {
            const customerId = data.customer_id?.toString();

            if (customerId) {
                const userResult = await query(
                    `SELECT id FROM users WHERE lemon_squeezy_customer_id = $1`,
                    [customerId]
                );

                if (userResult.rows.length > 0) {
                    userId = userResult.rows[0].id;
                }
            }
        }

        if (!userId) {
            console.error(
                `[Webhook ${eventName}] No user_id found in custom_data or customer_id mapping`
            );
            return NextResponse.json({ received: true });
        }

        console.log(
            `[Webhook ${eventName}] Processing for User: ${userId}, Customer: ${data.customer_id}, SubscriptionID: ${subscriptionId}, Variant: ${data.variant_id}`
        );

        // Obsługa różnych eventów
        switch (eventName) {
            case "order_created":
                // Order created doesn't always include subscription fields; acknowledge only.
                // Subscription updates will arrive via subscription_* events.
                break;

            case "subscription_created":
                await handleSubscriptionCreated(userId, data, subscriptionId);
                break;

            case "subscription_updated":
                await handleSubscriptionUpdated(userId, data, subscriptionId);
                break;

            case "subscription_cancelled":
            case "subscription_expired":
                await handleSubscriptionCancelled(userId, data);
                break;

            case "subscription_payment_success":
                await handlePaymentSuccess(userId, data);
                break;

            case "subscription_payment_failed":
                await handlePaymentFailed(userId, data);
                break;

            default:
                console.log(`Unhandled event: ${eventName}`);
        }

        // Oznacz webhook jako przetworzony
        await query(
            `UPDATE lemon_squeezy_webhooks 
             SET processed = true 
             WHERE event_name = $1 AND payload->>'data' = $2`,
            [eventName, JSON.stringify(payload.data)]
        );

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Webhook error:", error);
        return createErrorResponse("Webhook processing failed", 500);
    }
}

async function handleSubscriptionCreated(
    userId: string,
    data: any,
    subscriptionId: string
) {
    const plan = mapVariantToPlan(data.variant_id.toString());
    const storageLimit = getPlanStorageLimit(plan);

    console.log(
        `[handleSubscriptionCreated] User: ${userId}, Plan: ${plan}, Storage: ${storageLimit}, Customer: ${data.customer_id}, Subscription: ${subscriptionId}`
    );

    const result = await query(
        `UPDATE users 
         SET subscription_plan = $1,
             subscription_status = $2,
             storage_limit = $3,
             lemon_squeezy_customer_id = $4,
             lemon_squeezy_subscription_id = $5,
             subscription_ends_at = $6
         WHERE id = $7
         RETURNING subscription_plan, subscription_status, lemon_squeezy_customer_id, lemon_squeezy_subscription_id`,
        [
            plan,
            data.status,
            storageLimit,
            data.customer_id.toString(),
            subscriptionId,
            data.renews_at
                ? new Date(data.renews_at)
                : data.ends_at
                ? new Date(data.ends_at)
                : null,
            userId,
        ]
    );

    if (result.rows.length > 0) {
        console.log(
            "[handleSubscriptionCreated] ✅ Updated user:",
            result.rows[0]
        );
    } else {
        console.error(
            "[handleSubscriptionCreated] ❌ No user updated! Check if userId exists in database."
        );
    }
}

async function handleSubscriptionUpdated(
    userId: string,
    data: any,
    subscriptionId: string
) {
    const plan = mapVariantToPlan(data.variant_id.toString());
    const storageLimit = getPlanStorageLimit(plan);

    console.log(
        `[handleSubscriptionUpdated] User: ${userId}, Plan: ${plan}, Storage: ${storageLimit}, Subscription: ${subscriptionId}`
    );

    const result = await query(
        `UPDATE users 
         SET subscription_plan = $1,
             subscription_status = $2,
             storage_limit = $3,
             lemon_squeezy_subscription_id = $4,
             subscription_ends_at = $5
         WHERE id = $6
         RETURNING subscription_plan, subscription_status, lemon_squeezy_subscription_id`,
        [
            plan,
            data.status,
            storageLimit,
            subscriptionId,
            data.renews_at
                ? new Date(data.renews_at)
                : data.ends_at
                ? new Date(data.ends_at)
                : null,
            userId,
        ]
    );

    if (result.rows.length > 0) {
        console.log(
            "[handleSubscriptionUpdated] ✅ Updated user:",
            result.rows[0]
        );
    } else {
        console.error(
            "[handleSubscriptionUpdated] ❌ No user updated! Check if userId exists in database."
        );
    }
}

async function handleSubscriptionCancelled(userId: string, data: any) {
    await query(
        `UPDATE users 
         SET subscription_status = $1,
             subscription_ends_at = $2
         WHERE id = $3`,
        [
            data.status || "cancelled",
            data.ends_at ? new Date(data.ends_at) : null,
            userId,
        ]
    );
}

async function handlePaymentSuccess(userId: string, data: any) {
    const plan = mapVariantToPlan(data.variant_id.toString());
    const storageLimit = getPlanStorageLimit(plan);

    console.log(
        `[handlePaymentSuccess] User: ${userId}, Plan: ${plan}, Storage: ${storageLimit}, Customer: ${data.customer_id}`
    );

    // Aktualizuj wszystkie dane subskrypcji podczas payment success
    const result = await query(
        `UPDATE users 
         SET subscription_status = 'active',
             subscription_plan = $1,
             storage_limit = $2,
             lemon_squeezy_customer_id = $3
         WHERE id = $4
         RETURNING subscription_plan, subscription_status, lemon_squeezy_customer_id`,
        [plan, storageLimit, data.customer_id.toString(), userId]
    );

    if (result.rows.length > 0) {
        console.log("[handlePaymentSuccess] ✅ Updated user:", result.rows[0]);
    } else {
        console.error(
            "[handlePaymentSuccess] ❌ No user updated! Check if userId exists in database."
        );
    }
}

async function handlePaymentFailed(userId: string, data: any) {
    await query(
        `UPDATE users 
         SET subscription_status = 'past_due'
         WHERE id = $1`,
        [userId]
    );
}
