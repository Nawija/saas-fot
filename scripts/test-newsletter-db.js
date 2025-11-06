// Test script for newsletter database tables
const { query } = require("../lib/db");

async function testNewsletterTables() {
    console.log("🔍 Testing newsletter database tables...\n");

    try {
        // Test 1: Check if pgcrypto extension exists
        console.log("1. Checking pgcrypto extension...");
        const extensionCheck = await query(
            "SELECT * FROM pg_extension WHERE extname = 'pgcrypto'"
        );

        if (extensionCheck.rows.length === 0) {
            console.log("   ⚠️  pgcrypto not found. Installing...");
            await query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
            console.log("   ✅ pgcrypto extension installed");
        } else {
            console.log("   ✅ pgcrypto extension exists");
        }

        // Test 2: Check if newsletter_subscribers table exists
        console.log("\n2. Checking newsletter_subscribers table...");
        try {
            const subscribersCheck = await query(
                "SELECT COUNT(*) FROM newsletter_subscribers"
            );
            console.log(
                `   ✅ newsletter_subscribers table exists (${subscribersCheck.rows[0].count} records)`
            );
        } catch (error) {
            console.log("   ⚠️  Table not found. Creating...");
            await query(`
        CREATE TABLE newsletter_subscribers (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          email text UNIQUE NOT NULL,
          subscribed_at timestamptz DEFAULT now(),
          is_active boolean DEFAULT true,
          unsubscribe_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
        )
      `);

            // Create indexes
            await query(
                "CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email)"
            );
            await query(
                "CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = true"
            );

            console.log("   ✅ newsletter_subscribers table created");
        }

        // Test 3: Check if newsletter_messages table exists
        console.log("\n3. Checking newsletter_messages table...");
        try {
            const messagesCheck = await query(
                "SELECT COUNT(*) FROM newsletter_messages"
            );
            console.log(
                `   ✅ newsletter_messages table exists (${messagesCheck.rows[0].count} records)`
            );
        } catch (error) {
            console.log("   ⚠️  Table not found. Creating...");
            await query(`
        CREATE TABLE newsletter_messages (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          title text NOT NULL,
          content text NOT NULL,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        )
      `);

            // Create index
            await query(
                "CREATE INDEX idx_newsletter_messages_created ON newsletter_messages(created_at DESC)"
            );

            console.log("   ✅ newsletter_messages table created");
        }

        // Test 4: Try to insert a test subscriber
        console.log("\n4. Testing insert...");
        const testEmail = `test-${Date.now()}@example.com`;
        const insertResult = await query(
            "INSERT INTO newsletter_subscribers (email) VALUES ($1) RETURNING *",
            [testEmail]
        );
        console.log(
            `   ✅ Successfully inserted test subscriber: ${insertResult.rows[0].email}`
        );

        // Clean up test data
        await query("DELETE FROM newsletter_subscribers WHERE email = $1", [
            testEmail,
        ]);
        console.log("   ✅ Test data cleaned up");

        console.log("\n🎉 All newsletter database tests passed!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error:", error);
        process.exit(1);
    }
}

testNewsletterTables();
