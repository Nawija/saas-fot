/**
 * Typy plików obrazów dozwolone w systemie
 */
export const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
] as const;

/**
 * Sprawdza czy typ pliku jest dozwolonym obrazem
 */
export function isValidImageType(mimeType: string): boolean {
    return ALLOWED_IMAGE_TYPES.includes(mimeType as any);
}

/**
 * Sprawdza czy rozszerzenie pliku jest dozwolone
 */
export function isValidImageExtension(filename: string): boolean {
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
    return ext ? ALLOWED_IMAGE_EXTENSIONS.includes(ext as any) : false;
}

/**
 * Waliduje obraz - typ i rozmiar
 */
export function validateImage(
    file: File,
    maxSizeBytes: number = 20 * 1024 * 1024 // 20MB domyślnie
): {
    valid: boolean;
    error?: string;
} {
    if (!isValidImageType(file.type)) {
        return {
            valid: false,
            error: `Nieprawidłowy typ pliku. Dozwolone: ${ALLOWED_IMAGE_TYPES.join(
                ", "
            )}`,
        };
    }

    if (file.size > maxSizeBytes) {
        const maxMB = Math.round(maxSizeBytes / (1024 * 1024));
        return {
            valid: false,
            error: `Plik jest za duży. Maksymalny rozmiar: ${maxMB}MB`,
        };
    }

    return { valid: true };
}

/**
 * Pobiera rozszerzenie pliku z MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
    const map: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    };
    return map[mimeType] || ".jpg";
}

/**
 * Generuje bezpieczną nazwę pliku
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, "_")
        .replace(/_+/g, "_");
}
