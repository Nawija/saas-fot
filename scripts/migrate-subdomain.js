// scripts/migrate-subdomain.js
// Uruchom: node scripts/migrate-subdomain.js

require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log("🚀 Rozpoczynam migrację subdomain...");

        const migrationPath = path.join(
            __dirname,
            "..",
            "database",
            "migration_subdomain.sql"
        );
        const migrationSQL = fs.readFileSync(migrationPath, "utf8");

        // Podziel SQL na pojedyncze zapytania (pomijając puste linie i same komentarze)
        const statements = migrationSQL
            .split(";")
            .map((s) => {
                // Usuń komentarze z każdej linii
                return s
                    .split("\n")
                    .filter((line) => !line.trim().startsWith("--"))
                    .join("\n")
                    .trim();
            })
            .filter((s) => s.length > 0);

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
                    if (
                        error.code === "42P07" ||
                        error.code === "42701" ||
                        error.code === "42P16"
                    ) {
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

        console.log("✅ Migracja subdomain zakończona sukcesem!");
    } catch (error) {
        console.error("❌ Błąd migracji:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
