// scripts/migrate.js
// Uruchom: node scripts/migrate.js

require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log("🚀 Rozpoczynam migrację...");

        const migrationPath = path.join(
            __dirname,
            "..",
            "database",
            "migration_subscription.sql"
        );
        const migrationSQL = fs.readFileSync(migrationPath, "utf8");

        // Podziel SQL na pojedyncze zapytania (pomijając komentarze)
        const statements = migrationSQL
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.startsWith("--"));

        console.log(`📝 Znaleziono ${statements.length} zapytań SQL`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    await pool.query(statement + ";");
                    console.log(
                        `✅ Zapytanie ${i + 1}/${statements.length} wykonane`
                    );
                } catch (error) {
                    // Ignoruj błędy "already exists" - to normalne przy ponownym uruchomieniu
                    if (error.code === "42P07" || error.code === "42701") {
                        console.log(
                            `⚠️  Zapytanie ${i + 1} pominięte (już istnieje)`
                        );
                    } else {
                        console.error(
                            `❌ Błąd w zapytaniu ${i + 1}:`,
                            error.message
                        );
                        throw error;
                    }
                }
            }
        }

        console.log("\n✨ Migracja zakończona pomyślnie!");

        // Sprawdź utworzone tabele
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        console.log("\n📊 Tabele w bazie danych:");
        result.rows.forEach((row) => console.log(`   - ${row.table_name}`));
    } catch (error) {
        console.error("❌ Błąd migracji:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
