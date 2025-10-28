// scripts/migrate-hero-font.js
// Uruchom: node scripts/migrate-hero-font.js

require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log("🚀 Rozpoczynam migrację hero_font...");

        const migrationPath = path.join(
            __dirname,
            "..",
            "database",
            "migration_hero_font.sql"
        );
        const migrationSQL = fs.readFileSync(migrationPath, "utf8");

        const statements = migrationSQL
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.startsWith("--"));

        console.log(`📝 Znaleziono ${statements.length} zapytań SQL`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (!statement) continue;
            try {
                await pool.query(statement + ";");
                console.log(
                    `✅ Zapytanie ${i + 1}/${statements.length} wykonane`
                );
            } catch (error) {
                if (error.code === "42701") {
                    console.log(`⚠️  Kolumna już istnieje, pomijam (${i + 1})`);
                } else {
                    console.error(
                        `❌ Błąd w zapytaniu ${i + 1}:`,
                        error.message
                    );
                    throw error;
                }
            }
        }

        console.log("\n✨ Migracja hero_font zakończona pomyślnie!");
    } catch (error) {
        console.error("❌ Błąd migracji:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
