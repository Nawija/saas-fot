// scripts/migrate-bio.js
// Uruchom: node scripts/migrate-bio.js

require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log("🚀 Rozpoczynam migrację bio...");

        const migrationPath = path.join(
            __dirname,
            "..",
            "database",
            "migration_bio.sql"
        );
        const migrationSQL = fs.readFileSync(migrationPath, "utf8");

        // Podziel SQL na pojedyncze zapytania (pomijając komentarze)
        const statements = migrationSQL
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.startsWith("--"));

        console.log(`📝 Znaleziono ${statements.length} zapytań do wykonania`);

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            console.log(`\n⚡ Wykonuję zapytanie ${i + 1}/${statements.length}...`);
            console.log(stmt.substring(0, 100) + "...");
            await pool.query(stmt);
            console.log("✅ Sukces");
        }

        console.log("\n🎉 Migracja zakończona pomyślnie!");
        console.log("✨ Kolumna 'bio' została dodana do tabeli users");
    } catch (error) {
        console.error("❌ Błąd podczas migracji:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
