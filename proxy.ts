// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const PUBLIC_PATHS = [
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/google",
    "/g/",
    "/api/gallery/",
];

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hostname = request.headers.get("host") || "";
    const url = request.nextUrl.clone();

    // === SUBDOMAIN HANDLING ===
    // Development - skip for plain localhost and IPs, but allow subdomain.localhost
    const isPlainLocalhost =
        hostname === "localhost:3000" || hostname === "localhost";
    const isIP = hostname.match(/^\d+\.\d+\.\d+\.\d+/);

    if (!isPlainLocalhost && !isIP) {
        // For localhost development: wesele.localhost
        // For production: wesele.seovileo.pl
        let baseDomain = "localhost";
        if (!hostname.includes("localhost")) {
            const baseHost =
                process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") ||
                "seovileo.pl:3000";
            baseDomain = baseHost.split(":")[0];
        }

        const parts = hostname.replace(":3000", "").split(".");
        const domainParts = baseDomain.split(".");

        let subdomain = "";
        if (parts.length > domainParts.length) {
            subdomain = parts
                .slice(0, parts.length - domainParts.length)
                .join(".");
        }

        // Jeśli jest subdomena (nie www)
        if (subdomain && subdomain !== "www") {
            // Przekieruj na /g/[subdomain] z parametrem
            if (pathname === "/" || pathname === "") {
                url.pathname = `/g/${subdomain}`;
                url.searchParams.set("subdomain", subdomain);
                console.log(
                    `  → subdomain detected: ${subdomain}, rewrite to ${url.pathname}`
                );
                return NextResponse.rewrite(url);
            }

            // Dla innych ścieżek dodaj parametr subdomain
            if (!url.searchParams.has("subdomain")) {
                url.searchParams.set("subdomain", subdomain);
                console.log(`  → subdomain detected: ${subdomain}, add param`);
                return NextResponse.rewrite(url);
            }
        }
    }

    // === AUTH LOGIC ===
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
