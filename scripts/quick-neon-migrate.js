#!/usr/bin/env node

/**
 * Quick Neon Migration Script
 * Usage: node scripts/quick-neon-migrate.js
 *
 * This script will:
 * 1. Ask for your Neon DATABASE_URL
 * 2. Run the subdomain migration
 * 3. Verify the results
 */

const { Pool } = require("pg");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

async function runMigration() {
    console.log("\n🚀 Neon Database Migration - Subdomain System\n");
    console.log("📋 This will add 'subdomain' column to collections table\n");

    // Ask for connection string
    const connectionString = await question(
        "Enter your Neon DATABASE_URL:\n(postgres://user:pass@host/db?sslmode=require)\n> "
    );

    if (!connectionString.trim()) {
        console.error("❌ No connection string provided!");
        rl.close();
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: connectionString.trim(),
    });

    try {
        console.log("\n🔌 Connecting to database...");

        // Test connection
        await pool.query("SELECT NOW()");
        console.log("✅ Connected successfully!\n");

        // Run migration queries
        console.log("📝 Running migration...\n");

        // 1. Add subdomain column
        console.log("1️⃣  Adding subdomain column...");
        await pool.query(
            `ALTER TABLE collections ADD COLUMN IF NOT EXISTS subdomain VARCHAR(63)`
        );
        console.log("   ✅ Column added\n");

        // 2. Create unique index
        console.log("2️⃣  Creating unique index...");
        await pool.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_subdomain 
             ON collections(subdomain) 
             WHERE subdomain IS NOT NULL`
        );
        console.log("   ✅ Index created\n");

        // 3. Add comment
        console.log("3️⃣  Adding column comment...");
        try {
            await pool.query(
                `COMMENT ON COLUMN collections.subdomain IS 'Custom subdomain for gallery, e.g. "wedding" in wedding.seovileo.pl'`
            );
            console.log("   ✅ Comment added\n");
        } catch (e) {
            console.log("   ⚠️  Comment skipped (not critical)\n");
        }

        // 4. Verify column
        console.log("4️⃣  Verifying column...");
        const columnCheck = await pool.query(
            `SELECT column_name, data_type, character_maximum_length, is_nullable
             FROM information_schema.columns 
             WHERE table_name = 'collections' 
             AND column_name = 'subdomain'`
        );

        if (columnCheck.rows.length === 0) {
            throw new Error("Column verification failed!");
        }

        console.log("   ✅ Column verified:");
        console.log("      - Type:", columnCheck.rows[0].data_type);
        console.log(
            "      - Max length:",
            columnCheck.rows[0].character_maximum_length
        );
        console.log("      - Nullable:", columnCheck.rows[0].is_nullable);
        console.log("");

        // 5. Verify index
        console.log("5️⃣  Verifying index...");
        const indexCheck = await pool.query(
            `SELECT indexname, indexdef
             FROM pg_indexes
             WHERE tablename = 'collections'
             AND indexname = 'idx_collections_subdomain'`
        );

        if (indexCheck.rows.length === 0) {
            throw new Error("Index verification failed!");
        }

        console.log("   ✅ Index verified:");
        console.log("      - Name:", indexCheck.rows[0].indexname);
        console.log("");

        // 6. Check existing collections
        console.log("6️⃣  Checking collections...");
        const collectionsCheck = await pool.query(
            `SELECT COUNT(*) as total,
                    COUNT(subdomain) as with_subdomain
             FROM collections`
        );

        console.log("   ℹ️  Collections stats:");
        console.log(
            "      - Total collections:",
            collectionsCheck.rows[0].total
        );
        console.log(
            "      - With subdomain:",
            collectionsCheck.rows[0].with_subdomain
        );
        console.log("");

        console.log("✅ Migration completed successfully!\n");
        console.log("🎉 You can now use the subdomain system in your app!\n");
    } catch (error) {
        console.error("\n❌ Migration failed:");
        console.error(error.message);
        console.error("\nDetails:", error);
        process.exit(1);
    } finally {
        await pool.end();
        rl.close();
    }
}

runMigration();
