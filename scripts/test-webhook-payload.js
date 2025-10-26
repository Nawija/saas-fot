// Przykładowa struktura webhook payload od Lemon Squeezy
// Na podstawie dokumentacji: https://docs.lemonsqueezy.com/api/webhooks

const exampleSubscriptionCreatedPayload = {
    meta: {
        event_name: "subscription_created",
        custom_data: {
            user_id: "123",
        },
    },
    data: {
        type: "subscriptions",
        id: "123456", // <-- To jest subscription_id!
        attributes: {
            store_id: 1,
            customer_id: 789,
            order_id: 456,
            product_id: 1,
            variant_id: 1,
            product_name: "Example Product",
            variant_name: "Example Variant",
            user_name: "John Doe",
            user_email: "john@example.com",
            status: "active",
            status_formatted: "Active",
            card_brand: "visa",
            card_last_four: "4242",
            pause: null,
            cancelled: false,
            trial_ends_at: null,
            billing_anchor: 1,
            renews_at: "2024-01-15T12:00:00.000000Z",
            ends_at: null,
            created_at: "2024-01-01T12:00:00.000000Z",
            updated_at: "2024-01-01T12:00:00.000000Z",
            test_mode: false,
        },
    },
};

console.log("Subscription ID znajduje się w:");
console.log("payload.data.id =", exampleSubscriptionCreatedPayload.data.id);
console.log("\nCustomer ID znajduje się w:");
console.log(
    "payload.data.attributes.customer_id =",
    exampleSubscriptionCreatedPayload.data.attributes.customer_id
);

// Sprawdzenie naszego kodu
const payload = exampleSubscriptionCreatedPayload;
const subscriptionId = payload.data.id;
const data = payload.data.attributes;

console.log("\n✅ subscriptionId =", subscriptionId);
console.log("✅ customer_id =", data.customer_id);
console.log("✅ status =", data.status);
console.log("✅ renews_at =", data.renews_at);
