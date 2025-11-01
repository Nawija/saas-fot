const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

/**
 * Hashuje hasło używając bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Porównuje hasło z hashem
 */
export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

/**
 * Sprawdza czy hasło spełnia wymagania
 */
export function isValidPassword(password: string): {
    valid: boolean;
    error?: string;
} {
    if (!password || password.length < 6) {
        return {
            valid: false,
            error: "Hasło musi mieć co najmniej 6 znaków",
        };
    }

    return { valid: true };
}

/**
 * Hashuje hasło kolekcji (może zwrócić null jeśli password jest pusty)
 */
export async function hashCollectionPassword(
    password: string | null | undefined
): Promise<string | null> {
    if (!password || password === "") {
        return null;
    }
    return await hashPassword(password);
}
