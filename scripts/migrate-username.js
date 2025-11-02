#!/usr/bin/env node

/**
 * Username Migration Script
 * Usage: node scripts/migrate-username.js
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
    console.log("\n🚀 Username System Migration\n");
    console.log("📋 This will add username fields to users table\n");

    // Ask for connection string
    const connectionString = await question(
        "Enter your Neon DATABASE_URL:\n(or press Enter to use .env.local)\n> "
    );

    let dbUrl = connectionString.trim();
    if (!dbUrl) {
        require("dotenv").config({ path: ".env.local" });
        dbUrl = process.env.DATABASE_URL;
    }

    if (!dbUrl) {
        console.error("❌ No DATABASE_URL found!");
        rl.close();
        process.exit(1);
    }

    const pool = new Pool({ connectionString: dbUrl });

    try {
        console.log("\n🔌 Connecting to database...");
        await pool.query("SELECT NOW()");
        console.log("✅ Connected successfully!\n");

        console.log("📝 Running migration...\n");

        // 1. Add username column
        console.log("1️⃣  Adding username column...");
        await pool.query(
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(63)`
        );
        console.log("   ✅ Column added\n");

        // 2. Create unique index
        console.log("2️⃣  Creating unique index...");
        await pool.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username 
             ON users(username) WHERE username IS NOT NULL`
        );
        console.log("   ✅ Index created\n");

        // 3. Add column comment
        console.log("3️⃣  Adding column comment...");
        try {
            await pool.query(
                `COMMENT ON COLUMN users.username IS 'Unique username for user subdomain, e.g. "john" in john.seovileo.pl'`
            );
            console.log("   ✅ Comment added\n");
        } catch (e) {
            console.log("   ⚠️  Comment skipped (not critical)\n");
        }

        // 4. Add is_username_set flag
        console.log("4️⃣  Adding is_username_set flag...");
        await pool.query(
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_username_set BOOLEAN DEFAULT FALSE`
        );
        console.log("   ✅ Flag added\n");

        // 5. Add updated_at timestamp
        console.log("5️⃣  Adding updated_at timestamp...");
        await pool.query(
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`
        );
        console.log("   ✅ Timestamp added\n");

        // 6. Verify columns
        console.log("6️⃣  Verifying columns...");
        const columnCheck = await pool.query(
            `SELECT column_name, data_type, character_maximum_length, is_nullable
             FROM information_schema.columns 
             WHERE table_name = 'users' 
             AND column_name IN ('username', 'is_username_set', 'updated_at')`
        );

        if (columnCheck.rows.length < 3) {
            throw new Error("Column verification failed!");
        }

        console.log("   ✅ Columns verified:");
        columnCheck.rows.forEach((col) => {
            console.log(
                `      - ${col.column_name}: ${col.data_type}${
                    col.character_maximum_length
                        ? `(${col.character_maximum_length})`
                        : ""
                }`
            );
        });
        console.log("");

        // 7. Check existing users
        console.log("7️⃣  Checking users...");
        const usersCheck = await pool.query(
            `SELECT COUNT(*) as total,
                    COUNT(username) as with_username
             FROM users`
        );

        console.log("   ℹ️  Users stats:");
        console.log("      - Total users:", usersCheck.rows[0].total);
        console.log("      - With username:", usersCheck.rows[0].with_username);
        console.log("");

        console.log("✅ Migration completed successfully!\n");
        console.log(
            "🎉 Users will be prompted to set username on first login!\n"
        );
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
