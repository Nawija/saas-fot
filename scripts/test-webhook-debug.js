/**
 * Testuje webhook Lemon Squeezy - wysyła testowy payload do lokalnego endpointa
 *
 * Użycie:
 * node scripts/test-webhook-debug.js
 */

const crypto = require("crypto");

// Konfiguracja - dostosuj te wartości
const WEBHOOK_URL = "http://localhost:3000/api/webhooks/lemon-squeezy";
const WEBHOOK_SECRET =
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "your-webhook-secret";
const USER_ID = "your-user-uuid-here"; // Wstaw prawdziwy UUID użytkownika z bazy
const VARIANT_ID = process.env.NEXT_PUBLIC_LS_VARIANT_PRO || "123456"; // ID wariantu z Lemon Squeezy

// Przykładowy payload subscription_payment_success
const payload = {
    meta: {
        event_name: "subscription_payment_success",
        custom_data: {
            user_id: USER_ID,
        },
    },
    data: {
        type: "subscriptions",
        id: "123456", // subscription_id
        attributes: {
            store_id: 12345,
            customer_id: 67890,
            order_id: 11111,
            product_id: 22222,
            variant_id: parseInt(VARIANT_ID),
            product_name: "Pro Plan",
            variant_name: "Monthly",
            user_name: "Test User",
            user_email: "test@example.com",
            status: "active",
            status_formatted: "Active",
            card_brand: "visa",
            card_last_four: "4242",
            pause: null,
            cancelled: false,
            trial_ends_at: null,
            billing_anchor: 1,
            first_subscription_item: {
                id: 33333,
                subscription_id: 123456,
                price_id: 44444,
                quantity: 1,
                created_at: "2025-11-03T10:00:00.000000Z",
                updated_at: "2025-11-03T10:00:00.000000Z",
            },
            urls: {
                update_payment_method: "https://example.com/update",
                customer_portal: "https://example.com/portal",
            },
            renews_at: "2025-12-03T10:00:00.000000Z",
            ends_at: null,
            created_at: "2025-11-03T10:00:00.000000Z",
            updated_at: "2025-11-03T10:00:00.000000Z",
            test_mode: true,
        },
    },
};

// Generuj sygnaturę
const payloadString = JSON.stringify(payload);
const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
const signature = hmac.update(payloadString).digest("hex");

console.log("🚀 Wysyłam testowy webhook...");
console.log("📦 Payload:", JSON.stringify(payload, null, 2));
console.log("🔐 Signature:", signature);
console.log("👤 User ID:", USER_ID);
console.log("🎯 Variant ID:", VARIANT_ID);
console.log("");

// Wyślij webhook
fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
    },
    body: payloadString,
})
    .then((response) => response.json())
    .then((data) => {
        console.log("✅ Odpowiedź z serwera:", data);
    })
    .catch((error) => {
        console.error("❌ Błąd:", error.message);
    });
