import { query } from "@/lib/db";
import { PLANS, SubscriptionPlan } from "@/lib/plans";

export type UserPlanInfo = {
    plan: SubscriptionPlan;
    planDetails: (typeof PLANS)[SubscriptionPlan];
};

/**
 * Pobiera plan subskrypcji użytkownika
 */
export async function getUserPlan(userId: string): Promise<UserPlanInfo> {
    const result = await query(
        "SELECT subscription_plan FROM users WHERE id = $1",
        [userId]
    );

    const plan = (result.rows[0]?.subscription_plan ||
        "free") as SubscriptionPlan;
    const planDetails = PLANS[plan];

    return { plan, planDetails };
}

/**
 * Sprawdza czy użytkownik ma dostęp do funkcji premium
 */
export function hasPremiumAccess(plan: SubscriptionPlan): boolean {
    return plan !== "free";
}

/**
 * Sprawdza czy użytkownik może utworzyć kolejną galerię
 */
export async function canCreateGallery(userId: string): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    plan: SubscriptionPlan;
}> {
    const { plan, planDetails } = await getUserPlan(userId);

    const countResult = await query(
        "SELECT COUNT(*) as count FROM collections WHERE user_id = $1",
        [userId]
    );

    const current = parseInt(countResult.rows[0]?.count || "0");
    const limit = planDetails.maxCollections;
    const allowed = current < limit;

    return { allowed, current, limit, plan };
}

/**
 * Sprawdza czy użytkownik może przesłać plik o danym rozmiarze
 */
export async function canUploadFile(
    userId: string,
    fileSize: number
): Promise<{
    allowed: boolean;
    reason?: string;
}> {
    const { plan, planDetails } = await getUserPlan(userId);

    // Pobierz obecne użycie storage
    const storageResult = await query(
        "SELECT storage_used FROM users WHERE id = $1",
        [userId]
    );

    const storageUsed = parseInt(storageResult.rows[0]?.storage_used || "0");
    const storageLimit = planDetails.storage;

    if (storageUsed + fileSize > storageLimit) {
        return {
            allowed: false,
            reason: `Przekroczono limit storage (${(
                storageLimit /
                (1024 * 1024 * 1024)
            ).toFixed(1)}GB)`,
        };
    }

    return { allowed: true };
}

/**
 * Aktualizuje użycie storage użytkownika
 */
export async function updateUserStorage(
    userId: string,
    sizeDelta: number
): Promise<void> {
    await query(
        "UPDATE users SET storage_used = storage_used + $1 WHERE id = $2",
        [sizeDelta, userId]
    );
}

/**
 * Sprawdza czy użytkownik jest właścicielem kolekcji
 */
export async function isCollectionOwner(
    collectionId: string,
    userId: string
): Promise<boolean> {
    const result = await query(
        "SELECT id FROM collections WHERE id = $1 AND user_id = $2",
        [collectionId, userId]
    );

    return result.rows.length > 0;
}

/**
 * Pobiera kolekcję z weryfikacją właściciela
 */
export async function getCollectionForUser(
    collectionId: string,
    userId: string
) {
    const result = await query(
        `SELECT c.*, 
         (SELECT COUNT(*) FROM photos WHERE collection_id = c.id) as photo_count
         FROM collections c 
         WHERE c.id = $1 AND c.user_id = $2`,
        [collectionId, userId]
    );

    return result.rows[0] || null;
}

/**
 * Pobiera wszystkie kolekcje użytkownika
 */
export async function getUserCollections(userId: string) {
    const result = await query(
        `SELECT 
            c.*,
            COUNT(p.id) as photo_count
        FROM collections c
        LEFT JOIN photos p ON c.id = p.collection_id
        WHERE c.user_id = $1
        GROUP BY c.id
        ORDER BY c.created_at DESC`,
        [userId]
    );

    return result.rows;
}
