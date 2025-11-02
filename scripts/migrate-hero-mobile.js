#!/usr/bin/env node
require("dotenv").config({ path: ".env" });
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function migrate() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log("🚀 Running migration: hero_image_mobile...");

        const migrationPath = path.join(
            __dirname,
            "..",
            "database",
            "migration_hero_mobile.sql"
        );
        const sql = fs.readFileSync(migrationPath, "utf-8");

        const client = await pool.connect();
        try {
            await client.query(sql);
            console.log("✅ Migration completed successfully!");
            console.log("   - Added hero_image_mobile column to collections");
            console.log("   - Created index on hero_image_mobile");
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
