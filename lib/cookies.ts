// /lib/cookies.ts
export function setAuthCookie(res: any, token: string) {
    // in route handlers we return Response, so we'll set header 'Set-Cookie' instead
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure=${
        process.env.NODE_ENV === "production"
    }`;
    res.headers.append("Set-Cookie", cookie);
}
