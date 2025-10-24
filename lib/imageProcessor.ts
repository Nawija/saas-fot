import sharp from "sharp";

const AVATAR_SIZE = 200; // rozmiar avatara w pikselach
const AVATAR_QUALITY = 80; // jakość kompresji (0-100)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

interface ProcessedImage {
    buffer: Buffer;
    contentType: string;
    size: number;
}

/**
 * Przetwarza obraz do formatu avatara
 * - Zmienia rozmiar do 200x200px
 * - Konwertuje do WebP dla lepszej kompresji
 * - Optymalizuje jakość
 *
 * @param buffer - oryginalny bufor obrazu
 * @returns Promise<ProcessedImage>
 */
export async function processAvatarImage(
    buffer: Buffer
): Promise<ProcessedImage> {
    try {
        // Walidacja rozmiaru
        if (buffer.length > MAX_FILE_SIZE) {
            throw new Error(
                `Plik jest za duży. Maksymalny rozmiar to ${
                    MAX_FILE_SIZE / 1024 / 1024
                }MB`
            );
        }

        // Przetwarzanie obrazu
        const processedBuffer = await sharp(buffer)
            .resize(AVATAR_SIZE, AVATAR_SIZE, {
                fit: "cover",
                position: "center",
            })
            .webp({ quality: AVATAR_QUALITY })
            .toBuffer();

        return {
            buffer: processedBuffer,
            contentType: "image/webp",
            size: processedBuffer.length,
        };
    } catch (error: any) {
        console.error("Error processing image:", error);
        throw new Error(error.message || "Nie udało się przetworzyć obrazu");
    }
}

/**
 * Waliduje czy plik jest obrazem
 * @param mimetype - typ MIME pliku
 * @returns boolean
 */
export function isValidImageType(mimetype: string): boolean {
    const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
    ];
    return validTypes.includes(mimetype.toLowerCase());
}

/**
 * Generuje unikalną nazwę pliku dla avatara
 * @param userId - ID użytkownika
 * @returns string
 */
export function generateAvatarKey(userId: number): string {
    const timestamp = Date.now();
    return `avatars/user-${userId}-${timestamp}.webp`;
}
