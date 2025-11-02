import crypto from "crypto";
import jwt from "jsonwebtoken";
import { query } from "./db";

// Stałe konfiguracyjne
const SCRYPT_KEYLEN = 64;
const DEFAULT_SALT_LENGTH = 16;

/* ---------- Password Utilities ---------- */

/**
 * Generuje losowy salt do hashowania hasła
 * @param len - długość salt (domyślnie 16 bajtów)
 * @returns string - salt w formacie hex
 */
export function genSalt(len: number = DEFAULT_SALT_LENGTH): string {
    return crypto.randomBytes(len).toString("hex");
}

/**
 * Hashuje hasło używając scrypt
 * @param password - hasło do zahashowania
 * @param salt - salt używany do hashowania
 * @returns string - zhashowane hasło w formacie hex
 */
export function hashPassword(password: string, salt: string): string {
    const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
    return derived.toString("hex");
}

/* ---------- JWT Utilities ---------- */

/**
 * Tworzy JWT token
 * @param payload - dane do zakodowania w tokenie
 * @returns string - JWT token
 */
export function createJwt(payload: object): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN ||
        "7d") as jwt.SignOptions["expiresIn"];
    return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Weryfikuje i dekoduje JWT token
 * @param token - token do zweryfikowania
 * @returns object | null - zdekodowany payload lub null jeśli nieprawidłowy
 */
export function verifyJwt(token: string): any | null {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }
        return jwt.verify(token, secret);
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }
}

/* ---------- Database Helpers ---------- */

/**
 * Znajduje użytkownika po adresie email
 * @param email - adres email użytkownika
 * @returns Promise<User | null>
 */
export async function findUserByEmail(email: string): Promise<any | null> {
    try {
        const res = await query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        return res.rows[0] ?? null;
    } catch (error) {
        console.error("Error finding user by email:", error);
        return null;
    }
}

/**
 * Znajduje użytkownika po Google ID
 * @param googleId - ID użytkownika z Google
 * @returns Promise<User | null>
 */
export async function findUserByGoogleId(
    googleId: string
): Promise<any | null> {
    try {
        const res = await query("SELECT * FROM users WHERE google_id = $1", [
            googleId,
        ]);
        return res.rows[0] ?? null;
    } catch (error) {
        console.error("Error finding user by Google ID:", error);
        return null;
    }
}

/**
 * Tworzy nowego użytkownika z emailem i hasłem
 * @param email - adres email
 * @param passwordHash - zhashowane hasło
 * @param salt - salt użyty do hashowania
 * @returns Promise<User>
 */
export async function createUserWithEmail(
    email: string,
    passwordHash: string,
    salt: string
): Promise<any> {
    const res = await query(
        `INSERT INTO users (email, password_hash, salt, provider, subscription_plan, subscription_status, is_username_set) 
         VALUES ($1, $2, $3, 'email', 'free', 'free', FALSE) RETURNING *`,
        [email, passwordHash, salt]
    );
    return res.rows[0];
}

/* ---------- Google OAuth ---------- */

/**
 * Tworzy lub aktualizuje użytkownika Google
 * @param email - adres email z Google
 * @param googleId - ID użytkownika z Google
 * @param name - imię użytkownika (opcjonalne)
 * @param picture - URL avatara z Google (opcjonalne)
 * @returns Promise<User>
 */
export async function createOrUpdateGoogleUser(
    email: string,
    googleId: string,
    name?: string,
    picture?: string
): Promise<any> {
    try {
        const PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;

        // Funkcja sprawdzająca czy avatar jest z R2 (własny użytkownika)
        const isCustomAvatar = (avatarUrl: string | null) => {
            if (!avatarUrl) return false;
            return PUBLIC_DOMAIN && avatarUrl.startsWith(PUBLIC_DOMAIN);
        };

        // 1. Sprawdź czy użytkownik istnieje po Google ID
        const byGoogle = await findUserByGoogleId(googleId);
        if (byGoogle) {
            // Nie nadpisuj avatara jeśli użytkownik ma własny z R2
            const shouldUpdateAvatar = !isCustomAvatar(byGoogle.avatar);

            const updated = await query(
                `UPDATE users 
                 SET name = COALESCE($1, name),
                     avatar = CASE 
                         WHEN $2 = true THEN COALESCE($3, avatar)
                         ELSE avatar 
                     END
                 WHERE id = $4
                 RETURNING *`,
                [name, shouldUpdateAvatar, picture, byGoogle.id]
            );
            return updated.rows[0];
        }

        // 2. Sprawdź czy użytkownik istnieje po emailu
        const byEmail = await findUserByEmail(email);
        if (byEmail) {
            // Nie nadpisuj avatara jeśli użytkownik ma własny z R2
            const shouldUpdateAvatar = !isCustomAvatar(byEmail.avatar);

            const updated = await query(
                `UPDATE users 
                 SET provider = 'google',
                     google_id = $1,
                     name = COALESCE($2, name),
                     avatar = CASE 
                         WHEN $3 = true THEN COALESCE($4, avatar)
                         ELSE avatar 
                     END
                 WHERE id = $5
                 RETURNING *`,
                [googleId, name, shouldUpdateAvatar, picture, byEmail.id]
            );
            return updated.rows[0];
        }

        // 3. Utwórz nowego użytkownika (pierwsza rejestracja - użyj avatar z Google)
        const res = await query(
            `INSERT INTO users (email, provider, google_id, name, avatar, subscription_plan, subscription_status, is_username_set) 
             VALUES ($1, 'google', $2, $3, $4, 'free', 'free', FALSE)
             RETURNING *`,
            [email, googleId, name, picture]
        );
        return res.rows[0];
    } catch (error) {
        console.error("Error in createOrUpdateGoogleUser:", error);
        throw error;
    }
}
