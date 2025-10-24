import { query as dbQuery } from "@/lib/db";

/**
 * Aktualizuje wykorzystane miejsce dla użytkownika
 * @param userId - ID użytkownika
 * @param bytes - Ilość bajtów do dodania (dodatnia) lub odjęcia (ujemna)
 */
export async function updateStorageUsed(
    userId: number,
    bytes: number
): Promise<void> {
    const sql = `
        UPDATE users 
        SET storage_used = storage_used + $1,
            updated_at = NOW()
        WHERE id = $2
    `;

    await dbQuery(sql, [bytes, userId]);
}

/**
 * Pobiera aktualną ilość wykorzystanego miejsca przez użytkownika
 * @param userId - ID użytkownika
 * @returns Ilość wykorzystanych bajtów
 */
export async function getStorageUsed(userId: number): Promise<number> {
    const sql = `
        SELECT storage_used 
        FROM users 
        WHERE id = $1
    `;

    const result = await dbQuery(sql, [userId]);
    const val = result.rows[0]?.storage_used;
    // Postgres returns BIGINT as string — zawsze rzutujemy na number
    return val !== undefined && val !== null ? parseInt(val, 10) || 0 : 0;
}

/**
 * Pobiera limit miejsca dla użytkownika
 * @param userId - ID użytkownika
 * @returns Limit w bajtach
 */
export async function getStorageLimit(userId: number): Promise<number> {
    const sql = `
        SELECT storage_limit 
        FROM users 
        WHERE id = $1
    `;

    const result = await dbQuery(sql, [userId]);
    const val = result.rows[0]?.storage_limit;
    return val !== undefined && val !== null
        ? parseInt(val, 10) || 2147483648
        : 2147483648; // Domyślnie 2GB
}

/**
 * Sprawdza czy użytkownik może dodać plik o danym rozmiarze
 * @param userId - ID użytkownika
 * @param fileSize - Rozmiar pliku w bajtach
 * @returns True jeśli można dodać plik, false jeśli przekroczy limit
 */
export async function canUploadFile(
    userId: number,
    fileSize: number
): Promise<boolean> {
    const sql = `
        SELECT storage_used, storage_limit 
        FROM users 
        WHERE id = $1
    `;

    const result = await dbQuery(sql, [userId]);
    const user = result.rows[0];

    if (!user) return false;

    // Postgres returns BIGINT as string — rzutujemy na number, aby uniknąć konkatenacji string+number
    const used =
        user.storage_used !== undefined && user.storage_used !== null
            ? parseInt(user.storage_used, 10) || 0
            : 0;
    const limit =
        user.storage_limit !== undefined && user.storage_limit !== null
            ? parseInt(user.storage_limit, 10) || 2147483648
            : 2147483648;

    return used + fileSize <= limit;
}

/**
 * Aktualizuje limit miejsca na podstawie planu subskrypcji
 * @param userId - ID użytkownika
 * @param plan - Nazwa planu ('free', 'basic', 'pro', 'unlimited')
 */
export async function updateStorageLimit(
    userId: number,
    plan: "free" | "basic" | "pro" | "unlimited"
): Promise<void> {
    const limits = {
        free: 2 * 1024 * 1024 * 1024, // 2GB
        basic: 10 * 1024 * 1024 * 1024, // 10GB
        pro: 100 * 1024 * 1024 * 1024, // 100GB
        unlimited: 999999 * 1024 * 1024 * 1024, // ~1PB (praktycznie bez limitu)
    };

    const sql = `
        UPDATE users 
        SET storage_limit = $1,
            updated_at = NOW()
        WHERE id = $2
    `;

    await dbQuery(sql, [limits[plan], userId]);
}

/**
 * Resetuje wykorzystane miejsce (np. przy całkowitym usunięciu wszystkich zdjęć)
 * @param userId - ID użytkownika
 */
export async function resetStorageUsed(userId: number): Promise<void> {
    const sql = `
        UPDATE users 
        SET storage_used = 0,
            updated_at = NOW()
        WHERE id = $1
    `;

    await dbQuery(sql, [userId]);
}

/**
 * Pobiera statystyki storage'u użytkownika
 * @param userId - ID użytkownika
 * @returns Obiekt ze statystykami
 */
export async function getStorageStats(userId: number): Promise<{
    used: number;
    limit: number;
    available: number;
    percentUsed: number;
}> {
    const sql = `
        SELECT storage_used, storage_limit 
        FROM users 
        WHERE id = $1
    `;

    const result = await dbQuery(sql, [userId]);
    const user = result.rows[0];

    if (!user) {
        return {
            used: 0,
            limit: 2147483648,
            available: 2147483648,
            percentUsed: 0,
        };
    }

    const used =
        user.storage_used !== undefined && user.storage_used !== null
            ? parseInt(user.storage_used, 10) || 0
            : 0;
    const limit =
        user.storage_limit !== undefined && user.storage_limit !== null
            ? parseInt(user.storage_limit, 10) || 2147483648
            : 2147483648;

    const available = Math.max(0, limit - used);
    const percentUsed = limit > 0 ? (used / limit) * 100 : 0;

    return {
        used,
        limit,
        available,
        percentUsed,
    };
}
