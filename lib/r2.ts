import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

// Konfiguracja klienta R2
const r2Client = new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET || "foto";
const PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;

/**
 * Generuje ścieżki do plików w R2
 */
export const R2Paths = {
    avatar: (userId: string) => `users/${userId}/avatar/profile.jpg`,
    collectionHero: (userId: string, collectionId: number) =>
        `users/${userId}/collections/${collectionId}/hero.jpg`,
    collectionPhoto: (
        userId: string,
        collectionId: number,
        photoId: number,
        ext: string
    ) => `users/${userId}/collections/${collectionId}/photos/${photoId}.${ext}`,
};

/**
 * Przesyła plik do R2
 * @param buffer - bufor pliku
 * @param key - ścieżka w bucket (np. "avatars/user-123.jpg")
 * @param contentType - typ MIME
 * @returns Promise<string> - publiczny URL
 */
export async function uploadToR2(
    buffer: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });

        await r2Client.send(command);

        // Zwróć publiczny URL
        return `${PUBLIC_DOMAIN}/${key}`;
    } catch (error) {
        console.error("Error uploading to R2:", error);
        throw new Error("Nie udało się przesłać pliku");
    }
}

/**
 * Usuwa plik z R2
 * @param key - ścieżka w bucket
 */
export async function deleteFromR2(key: string): Promise<void> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);
    } catch (error) {
        console.error("Error deleting from R2:", error);
        // Nie rzucamy błędu - usunięcie starego pliku nie jest krytyczne
    }
}

/**
 * Wyciąga klucz z pełnego URL R2
 * @param url - pełny URL do pliku
 * @returns string - klucz (ścieżka w bucket)
 */
export function extractKeyFromUrl(url: string): string | null {
    if (!url || !PUBLIC_DOMAIN) return null;

    if (url.startsWith(PUBLIC_DOMAIN)) {
        return url.replace(`${PUBLIC_DOMAIN}/`, "");
    }

    return null;
}

/**
 * Usuwa wiele plików z R2 (batch delete)
 * @param urls - tablica URL-i do usunięcia
 */
export async function deleteMultipleFromR2(urls: string[]): Promise<void> {
    try {
        const keys = urls
            .map((url) => extractKeyFromUrl(url))
            .filter((key): key is string => key !== null);

        if (keys.length === 0) {
            console.log("[R2] No valid keys to delete");
            return;
        }

        console.log(`[R2] Deleting ${keys.length} objects`);

        // Usuń w batch (max 1000 na raz)
        const batchSize = 1000;
        for (let i = 0; i < keys.length; i += batchSize) {
            const batch = keys.slice(i, i + batchSize);

            const deleteCommand = new DeleteObjectsCommand({
                Bucket: BUCKET_NAME,
                Delete: {
                    Objects: batch.map((key) => ({ Key: key })),
                    Quiet: true,
                },
            });

            const result = await r2Client.send(deleteCommand);

            if (result.Errors && result.Errors.length > 0) {
                console.error("[R2] Errors deleting objects:", result.Errors);
            }
        }

        console.log(`[R2] Successfully deleted ${keys.length} objects`);
    } catch (error) {
        console.error("Error deleting multiple from R2:", error);
        throw new Error("Nie udało się usunąć plików z R2");
    }
}

/**
 * Usuwa całą kolekcję z R2 (folder collections/{collectionId})
 * @param userId - ID użytkownika
 * @param collectionId - ID kolekcji
 */
export async function deleteCollectionFolder(
    userId: string,
    collectionId: number
): Promise<void> {
    try {
        const prefix = `users/${userId}/collections/${collectionId}/`;
        let totalDeleted = 0;
        let continuationToken: string | undefined;

        console.log(`[R2] Starting deletion of collection folder: ${prefix}`);

        // Pętla do obsługi paginacji (R2 zwraca max 1000 obiektów na raz)
        do {
            // Pobierz listę obiektów
            const listCommand = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            });

            const listedObjects = await r2Client.send(listCommand);

            if (
                !listedObjects.Contents ||
                listedObjects.Contents.length === 0
            ) {
                console.log(
                    `[R2] No more objects found for collection ${collectionId}`
                );
                break;
            }

            // Usuń wszystkie obiekty z tej strony
            const deleteCommand = new DeleteObjectsCommand({
                Bucket: BUCKET_NAME,
                Delete: {
                    Objects: listedObjects.Contents.map((obj) => ({
                        Key: obj.Key!,
                    })),
                    Quiet: true,
                },
            });

            const deleteResult = await r2Client.send(deleteCommand);

            const deletedCount = listedObjects.Contents.length;
            totalDeleted += deletedCount;

            console.log(
                `[R2] Deleted ${deletedCount} objects (total: ${totalDeleted})`
            );

            // Sprawdź czy są błędy przy usuwaniu
            if (deleteResult.Errors && deleteResult.Errors.length > 0) {
                console.error(
                    `[R2] Errors deleting objects:`,
                    deleteResult.Errors
                );
            }

            // Sprawdź czy są kolejne strony do przetworzenia
            continuationToken = listedObjects.NextContinuationToken;
        } while (continuationToken);

        console.log(
            `[R2] Successfully deleted ${totalDeleted} total objects for collection ${collectionId}`
        );
    } catch (error) {
        console.error("[R2] Error deleting collection folder:", error);
        throw new Error("Nie udało się usunąć kolekcji z R2");
    }
}

/**
 * Usuwa całą zawartość folderu użytkownika z R2
 * @param userId - ID użytkownika
 */
export async function deleteUserFolder(userId: string): Promise<void> {
    try {
        const prefix = `users/${userId}/`;
        let totalDeleted = 0;
        let continuationToken: string | undefined;

        console.log(`[R2] Starting deletion of folder: ${prefix}`);

        // Pętla do obsługi paginacji (R2 zwraca max 1000 obiektów na raz)
        do {
            // Pobierz listę obiektów
            const listCommand = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            });

            const listedObjects = await r2Client.send(listCommand);

            if (
                !listedObjects.Contents ||
                listedObjects.Contents.length === 0
            ) {
                console.log(`[R2] No more objects found for user ${userId}`);
                break;
            }

            // Usuń wszystkie obiekty z tej strony
            const deleteCommand = new DeleteObjectsCommand({
                Bucket: BUCKET_NAME,
                Delete: {
                    Objects: listedObjects.Contents.map((obj) => ({
                        Key: obj.Key!,
                    })),
                    Quiet: true,
                },
            });

            const deleteResult = await r2Client.send(deleteCommand);

            const deletedCount = listedObjects.Contents.length;
            totalDeleted += deletedCount;

            console.log(
                `[R2] Deleted ${deletedCount} objects (total: ${totalDeleted})`
            );

            // Sprawdź czy są błędy przy usuwaniu
            if (deleteResult.Errors && deleteResult.Errors.length > 0) {
                console.error(
                    `[R2] Errors deleting objects:`,
                    deleteResult.Errors
                );
            }

            // Sprawdź czy są kolejne strony do przetworzenia
            continuationToken = listedObjects.NextContinuationToken;
        } while (continuationToken);

        console.log(
            `[R2] Successfully deleted ${totalDeleted} total objects for user ${userId}`
        );
    } catch (error) {
        console.error("[R2] Error deleting user folder:", error);
        throw new Error("Nie udało się usunąć plików użytkownika");
    }
}
