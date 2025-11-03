/**
 * Ręcznie łączy użytkownika z klientem Lemon Squeezy
 * Użyj tego gdy nie możesz znaleźć użytkownika przez webhooki
 *
 * Użycie:
 * node scripts/link-lemon-customer.js <user-email> <customer-id>
 */

const { Client } = require("pg");

async function linkCustomer(email, customerId) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("✅ Połączono z bazą danych\n");

        // Znajdź użytkownika
        const userResult = await client.query(
            "SELECT id, email, subscription_plan FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            console.log(`❌ Nie znaleziono użytkownika z emailem: ${email}`);
            return;
        }

        const user = userResult.rows[0];
        console.log(`👤 Znaleziono użytkownika:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Aktualny plan: ${user.subscription_plan}`);
        console.log("");

        // Zaktualizuj customer_id
        await client.query(
            "UPDATE users SET lemon_squeezy_customer_id = $1 WHERE id = $2",
            [customerId, user.id]
        );

        console.log(
            `✅ Zaktualizowano lemon_squeezy_customer_id na: ${customerId}`
        );
        console.log("");
        console.log("🎉 Teraz webhooki powinny działać!");
        console.log(
            "   Spróbuj zrobić test w Lemon Squeezy Dashboard → Send test webhook"
        );
    } catch (error) {
        console.error("❌ Błąd:", error.message);
    } finally {
        await client.end();
    }
}

// Pobierz argumenty z linii komend
const email = process.argv[2];
const customerId = process.argv[3];

if (!email || !customerId) {
    console.log(
        "❌ Użycie: node scripts/link-lemon-customer.js <user-email> <customer-id>"
    );
    console.log("");
    console.log("Przykład:");
    console.log("  node scripts/link-lemon-customer.js user@example.com 12345");
    console.log("");
    console.log("Gdzie znaleźć customer_id:");
    console.log("  1. Zaloguj się do Lemon Squeezy Dashboard");
    console.log("  2. Przejdź do Customers");
    console.log("  3. Znajdź swojego klienta");
    console.log("  4. Skopiuj Customer ID (liczba)");
    process.exit(1);
}

linkCustomer(email, customerId);
