// /lib/auth.ts
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { query } from "./db";

const SCRYPT_KEYLEN = 64;

export function genSalt(len = 16) {
    return crypto.randomBytes(len).toString("hex");
}

export function hashPassword(password: string, salt: string) {
    const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
    return derived.toString("hex");
}

export function createJwt(payload: object) {
    const secret = process.env.JWT_SECRET as string;
    const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyJwt(token: string) {
    try {
        const secret = process.env.JWT_SECRET!;
        return jwt.verify(token, secret) as any;
    } catch (e) {
        return null;
    }
}

/* DB helpers */

export async function findUserByEmail(email: string) {
    const res = await query("SELECT * FROM users WHERE email = $1", [email]);
    return res.rows[0] ?? null;
}

export async function findUserByGoogleId(googleId: string) {
    const res = await query("SELECT * FROM users WHERE google_id = $1", [
        googleId,
    ]);
    return res.rows[0] ?? null;
}

export async function createUserWithEmail(
    email: string,
    passwordHash: string,
    salt: string
) {
    const res = await query(
        `INSERT INTO users (email, password_hash, salt, provider) VALUES ($1, $2, $3, 'email') RETURNING *`,
        [email, passwordHash, salt]
    );
    return res.rows[0];
}

export async function createOrUpdateGoogleUser(
    email: string,
    googleId: string
) {
    // jeśli istnieje user o google_id -> zwróć, jeśli istnieje po email -> zaktualizuj google_id, inaczej stwórz
    const byGoogle = await findUserByGoogleId(googleId);
    if (byGoogle) return byGoogle;

    const byEmail = await findUserByEmail(email);
    if (byEmail) {
        const res = await query(
            `UPDATE users SET provider='google', google_id=$1 WHERE id=$2 RETURNING *`,
            [googleId, byEmail.id]
        );
        return res.rows[0];
    }

    const res = await query(
        `INSERT INTO users (email, provider, google_id) VALUES ($1, 'google', $2) RETURNING *`,
        [email, googleId]
    );
    return res.rows[0];
}
