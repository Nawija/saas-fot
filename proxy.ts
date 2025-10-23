// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = "nodejs"; // proxy.ts runs on Node.js runtime

const PUBLIC_PATHS = [
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/google",
];

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log("🧩 proxy.ts fired for:", pathname);

    // Osobna obsługa strony głównej
    if (pathname === "/") {
        console.log("  → public path (root), allow /");
        return NextResponse.next();
    }

    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        console.log("  → public path, allow:", pathname);
        return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value;
    console.log("  → token present?:", Boolean(token));

    if (!token) {
        console.log("  → no token — redirect to /login");
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("  → JWT_SECRET is not set!");
            return NextResponse.redirect(new URL("/login", request.url));
        }

        jwt.verify(token, secret);
        console.log("  → token OK — allow");
        return NextResponse.next();
    } catch (err) {
        console.error("  → jwt verify failed:", (err as Error).message);
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
