require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

async function addBioColumn() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log("🚀 Dodawanie kolumny bio...");

        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS bio TEXT 
            DEFAULT 'Photo galleries & portfolio'
        `);
        console.log("✅ Kolumna bio dodana!");

        await pool.query(`
            UPDATE users 
            SET bio = 'Photo galleries & portfolio' 
            WHERE bio IS NULL
        `);
        console.log("✅ Istniejący użytkownicy zaktualizowani!");

        // Sprawdź wynik
        const result = await pool.query(`
            SELECT id, name, bio 
            FROM users 
            LIMIT 3
        `);
        console.log("\n📋 Przykładowi użytkownicy:");
        console.table(result.rows);
    } catch (error) {
        console.error("❌ Błąd:", error.message);
    } finally {
        await pool.end();
    }
}

addBioColumn();
