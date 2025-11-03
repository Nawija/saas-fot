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

        // Zapisz webhook do bazy
        await query(
            `INSERT INTO lemon_squeezy_webhooks (event_name, payload, processed) 
             VALUES ($1, $2, false)`,
            [eventName, payload]
        );

        const data = payload.data.attributes;

        // Pobierz user_id na podstawie customer_id z Lemon Squeezy
        const customerId = data.customer_id?.toString();

        if (!customerId) {
            console.error("No customer_id in webhook payload");
            return NextResponse.json({ received: true });
        }

        const userResult = await query(
            `SELECT id FROM users WHERE lemon_squeezy_customer_id = $1`,
            [customerId]
        );

        if (userResult.rows.length === 0) {
            console.error(`No user found for customer_id: ${customerId}`);
            return NextResponse.json({ received: true });
        }

        const userId = userResult.rows[0].id;
        const subscriptionId = payload.data.id; // ID subskrypcji jest tutaj, nie w attributes

        console.log(
            `[Webhook ${eventName}] User: ${userId}, SubscriptionID: ${subscriptionId}`
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
        `[handleSubscriptionCreated] Saving subscription_id: ${subscriptionId} for user: ${userId}`
    );

    await query(
        `UPDATE users 
         SET subscription_plan = $1,
             subscription_status = $2,
             storage_limit = $3,
             lemon_squeezy_customer_id = $4,
             lemon_squeezy_subscription_id = $5,
             subscription_ends_at = $6
         WHERE id = $7`,
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
}

async function handleSubscriptionUpdated(
    userId: string,
    data: any,
    subscriptionId: string
) {
    const plan = mapVariantToPlan(data.variant_id.toString());
    const storageLimit = getPlanStorageLimit(plan);

    console.log(
        `[handleSubscriptionUpdated] Saving subscription_id: ${subscriptionId} for user: ${userId}`
    );

    await query(
        `UPDATE users 
         SET subscription_plan = $1,
             subscription_status = $2,
             storage_limit = $3,
             lemon_squeezy_subscription_id = $4,
             subscription_ends_at = $5
         WHERE id = $6`,
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
        `[handlePaymentSuccess] Setting plan: ${plan}, storage: ${storageLimit} for user: ${userId}`
    );

    await query(
        `UPDATE users 
         SET subscription_status = 'active',
             subscription_plan = $1,
             storage_limit = $2
         WHERE id = $3`,
        [plan, storageLimit, userId]
    );
}

async function handlePaymentFailed(userId: string, data: any) {
    await query(
        `UPDATE users 
         SET subscription_status = 'past_due'
         WHERE id = $1`,
        [userId]
    );
}
