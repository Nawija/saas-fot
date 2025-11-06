import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const results: string[] = [];

    try {
        results.push("🔍 Checking newsletter database setup...\n");

        // 1. Check pgcrypto extension
        results.push("1. Checking pgcrypto extension...");
        try {
            await query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
            results.push("   ✅ pgcrypto extension ready\n");
        } catch (error: any) {
            results.push(`   ⚠️  pgcrypto error: ${error.message}\n`);
        }

        // 2. Check/Create newsletter_subscribers table
        results.push("2. Checking newsletter_subscribers table...");
        try {
            const check = await query(
                "SELECT COUNT(*) FROM newsletter_subscribers"
            );
            results.push(
                `   ✅ Table exists with ${check.rows[0].count} subscribers\n`
            );
        } catch (error) {
            results.push("   ⚠️  Table not found. Creating...");
            try {
                await query(`
          CREATE TABLE newsletter_subscribers (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            email text UNIQUE NOT NULL,
            subscribed_at timestamptz DEFAULT now(),
            is_active boolean DEFAULT true,
            unsubscribe_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
          )
        `);

                await query(
                    "CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email)"
                );
                await query(
                    "CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = true"
                );

                results.push("   ✅ newsletter_subscribers table created\n");
            } catch (createError: any) {
                results.push(
                    `   ❌ Failed to create table: ${createError.message}\n`
                );
            }
        }

        // 3. Check/Create newsletter_messages table
        results.push("3. Checking newsletter_messages table...");
        try {
            const check = await query(
                "SELECT COUNT(*) FROM newsletter_messages"
            );
            results.push(
                `   ✅ Table exists with ${check.rows[0].count} messages\n`
            );
        } catch (error) {
            results.push("   ⚠️  Table not found. Creating...");
            try {
                await query(`
          CREATE TABLE newsletter_messages (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            title text NOT NULL,
            content text NOT NULL,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          )
        `);

                await query(
                    "CREATE INDEX idx_newsletter_messages_created ON newsletter_messages(created_at DESC)"
                );

                results.push("   ✅ newsletter_messages table created\n");
            } catch (createError: any) {
                results.push(
                    `   ❌ Failed to create table: ${createError.message}\n`
                );
            }
        }

        // 4. Test insert
        results.push("4. Testing insert capability...");
        try {
            const testEmail = `test-${Date.now()}@example.com`;
            const insertResult = await query(
                "INSERT INTO newsletter_subscribers (email) VALUES ($1) RETURNING *",
                [testEmail]
            );

            results.push(
                `   ✅ Insert test successful: ${insertResult.rows[0].email}`
            );

            // Cleanup
            await query("DELETE FROM newsletter_subscribers WHERE email = $1", [
                testEmail,
            ]);
            results.push("   ✅ Cleanup successful\n");
        } catch (testError: any) {
            results.push(`   ⚠️  Insert test failed: ${testError.message}\n`);
        }

        results.push("\n🎉 Newsletter database setup complete!");

        return NextResponse.json(
            {
                success: true,
                message: "Newsletter database setup complete",
                details: results.join("\n"),
            },
            { status: 200 }
        );
    } catch (error: any) {
        results.push(`\n❌ Fatal error: ${error.message}`);

        return NextResponse.json(
            {
                success: false,
                error: error.message,
                details: results.join("\n"),
            },
            { status: 500 }
        );
    }
}
