import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
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
