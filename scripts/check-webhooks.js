/**
 * Sprawdza ostatnie webhooki z Lemon Squeezy w bazie danych
 */

const { Client } = require("pg");

async function checkWebhooks() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("✅ Połączono z bazą danych\n");

        // Pobierz ostatnie webhooki
        const result = await client.query(`
            SELECT 
                id,
                event_name,
                created_at,
                processed,
                payload->'data'->'attributes'->>'variant_id' as variant_id,
                payload->'data'->'attributes'->>'customer_id' as customer_id,
                payload->'data'->'attributes'->>'status' as status,
                payload->'meta'->'custom_data'->>'user_id' as user_id
            FROM lemon_squeezy_webhooks 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        console.log(`📦 Ostatnie ${result.rows.length} webhooków:\n`);

        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.event_name}`);
            console.log(`   Czas: ${row.created_at}`);
            console.log(`   Przetworzony: ${row.processed ? "✅" : "❌"}`);
            console.log(`   User ID: ${row.user_id || "BRAK"}`);
            console.log(`   Customer ID: ${row.customer_id || "BRAK"}`);
            console.log(`   Variant ID: ${row.variant_id || "BRAK"}`);
            console.log(`   Status: ${row.status || "BRAK"}`);
            console.log("");
        });

        // Sprawdź użytkownika
        if (result.rows.length > 0 && result.rows[0].customer_id) {
            console.log("\n👤 Sprawdzam użytkownika...\n");

            const userResult = await client.query(
                `
                SELECT 
                    id,
                    email,
                    subscription_plan,
                    subscription_status,
                    lemon_squeezy_customer_id,
                    lemon_squeezy_subscription_id
                FROM users 
                WHERE lemon_squeezy_customer_id = $1
            `,
                [result.rows[0].customer_id]
            );

            if (userResult.rows.length > 0) {
                const user = userResult.rows[0];
                console.log(`Email: ${user.email}`);
                console.log(`Plan: ${user.subscription_plan}`);
                console.log(`Status: ${user.subscription_status}`);
                console.log(`Customer ID: ${user.lemon_squeezy_customer_id}`);
                console.log(
                    `Subscription ID: ${user.lemon_squeezy_subscription_id}`
                );
            } else {
                console.log("❌ Nie znaleziono użytkownika z tym customer_id");

                // Spróbuj znaleźć po user_id
                if (result.rows[0].user_id) {
                    console.log("\nSprawdzam po user_id...\n");
                    const userByIdResult = await client.query(
                        `
                        SELECT 
                            id,
                            email,
                            subscription_plan,
                            subscription_status,
                            lemon_squeezy_customer_id,
                            lemon_squeezy_subscription_id
                        FROM users 
                        WHERE id = $1
                    `,
                        [result.rows[0].user_id]
                    );

                    if (userByIdResult.rows.length > 0) {
                        const user = userByIdResult.rows[0];
                        console.log(`Email: ${user.email}`);
                        console.log(`Plan: ${user.subscription_plan}`);
                        console.log(`Status: ${user.subscription_status}`);
                        console.log(
                            `Customer ID: ${
                                user.lemon_squeezy_customer_id || "BRAK"
                            }`
                        );
                        console.log(
                            `Subscription ID: ${
                                user.lemon_squeezy_subscription_id || "BRAK"
                            }`
                        );
                    }
                }
            }
        }

        // Pokaż mapowanie variant_id
        console.log("\n🎯 Mapowanie Variant ID:");
        console.log(`BASIC: ${process.env.NEXT_PUBLIC_LS_VARIANT_BASIC}`);
        console.log(`PRO: ${process.env.NEXT_PUBLIC_LS_VARIANT_PRO}`);
        console.log(
            `UNLIMITED: ${process.env.NEXT_PUBLIC_LS_VARIANT_UNLIMITED}`
        );
    } catch (error) {
        console.error("❌ Błąd:", error.message);
    } finally {
        await client.end();
    }
}

checkWebhooks();
