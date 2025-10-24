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

        // Pobierz user_id z custom_data
        const userId = payload.meta.custom_data?.user_id;

        if (!userId) {
            console.error("No user_id in webhook payload");
            return NextResponse.json({ received: true });
        }

        const data = payload.data.attributes;

        // Obsługa różnych eventów
        switch (eventName) {
            case "order_created":
            case "subscription_created":
                await handleSubscriptionCreated(userId, data);
                break;

            case "subscription_updated":
                await handleSubscriptionUpdated(userId, data);
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

async function handleSubscriptionCreated(userId: string, data: any) {
    const plan = mapVariantToPlan(data.variant_id.toString());
    const storageLimit = getPlanStorageLimit(plan);

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
            data.subscription_id?.toString() || null,
            data.ends_at ? new Date(data.ends_at) : null,
            userId,
        ]
    );
}

async function handleSubscriptionUpdated(userId: string, data: any) {
    const plan = mapVariantToPlan(data.variant_id.toString());
    const storageLimit = getPlanStorageLimit(plan);

    await query(
        `UPDATE users 
         SET subscription_plan = $1,
             subscription_status = $2,
             storage_limit = $3,
             subscription_ends_at = $4
         WHERE id = $5`,
        [
            plan,
            data.status,
            storageLimit,
            data.ends_at ? new Date(data.ends_at) : null,
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
    await query(
        `UPDATE users 
         SET subscription_status = 'active'
         WHERE id = $1`,
        [userId]
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
