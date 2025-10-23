// /lib/auth.ts
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { query } from "./db";

const SCRYPT_KEYLEN = 64;

/* ---------- Password utils ---------- */

export function genSalt(len = 16) {
    return crypto.randomBytes(len).toString("hex");
}

export function hashPassword(password: string, salt: string) {
    const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
    return derived.toString("hex");
}

/* ---------- JWT utils ---------- */

export function createJwt(payload: object) {
    const secret = process.env.JWT_SECRET as string;
    const expiresIn = (process.env.JWT_EXPIRES_IN ||
        "7d") as jwt.SignOptions["expiresIn"];
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyJwt(token: string) {
    try {
        const secret = process.env.JWT_SECRET!;
        return jwt.verify(token, secret) as any;
    } catch {
        return null;
    }
}

/* ---------- DB helpers ---------- */

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
        `INSERT INTO users (email, password_hash, salt, provider) 
         VALUES ($1, $2, $3, 'email') RETURNING *`,
        [email, passwordHash, salt]
    );
    return res.rows[0];
}

/* ---------- Google OAuth ---------- */

export async function createOrUpdateGoogleUser(
    email: string,
    googleId: string,
    name?: string,
    picture?: string
) {
    console.log("createOrUpdateGoogleUser called with:", {
        email,
        googleId,
        name,
        picture,
    });
    // 🔹 1. sprawdź czy istnieje po google_id
    const byGoogle = await findUserByGoogleId(googleId);
    if (byGoogle) {
        // aktualizuj name/avatar jeśli się zmieniły
        const updated = await query(
            `UPDATE users 
             SET name = COALESCE($1, name),
                 avatar = COALESCE($2, avatar)
             WHERE id = $3
             RETURNING *`,
            [name, picture, byGoogle.id]
        );
          console.log("createOrUpdateGoogleUser result updated.rows[0]:", updated.rows[0]);
        return updated.rows[0];
    }

    // 🔹 2. sprawdź czy istnieje po emailu
    const byEmail = await findUserByEmail(email);
    if (byEmail) {
        const updated = await query(
            `UPDATE users 
             SET provider='google',
                 google_id=$1,
                 name = COALESCE($2, name),
                 avatar = COALESCE($3, avatar)
             WHERE id=$4
             RETURNING *`,
            [googleId, name, picture, byEmail.id]
        );
        
        return updated.rows[0];
    }
    

    // 🔹 3. jeśli nie istnieje — utwórz nowego
    const res = await query(
        `INSERT INTO users (email, provider, google_id, name, avatar) 
         VALUES ($1, 'google', $2, $3, $4)
         RETURNING *`,
        [email, googleId, name, picture]
    );
      console.log("createOrUpdateGoogleUser result res.rows[0]:",  res.rows[0]);
    return res.rows[0];
    
}
