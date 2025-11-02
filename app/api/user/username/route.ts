import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import { withMiddleware } from "@/lib/utils/apiMiddleware";

export const POST = withMiddleware(
    async (req, { user }) => {
        try {
            const { username } = await req.json();

            if (!username) {
                return createErrorResponse("Username is required", 400);
            }

            // Validation - minimum 2 characters
            const usernameRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
            if (!usernameRegex.test(username)) {
                return createErrorResponse(
                    "Username can only contain lowercase letters, numbers, and hyphens (2-63 chars)",
                    400
                );
            }

            if (username.length < 2) {
                return createErrorResponse(
                    "Username must be at least 2 characters",
                    400
                );
            }

            // Reserved usernames
            const RESERVED = [
                "www",
                "api",
                "admin",
                "dashboard",
                "mail",
                "ftp",
                "smtp",
                "app",
                "cdn",
                "static",
                "assets",
                "upload",
                "download",
            ];
            if (RESERVED.includes(username.toLowerCase())) {
                return createErrorResponse("This username is reserved", 400);
            }

            // Check if username already exists
            const existingUser = await query(
                "SELECT id FROM users WHERE username = $1",
                [username]
            );

            if (existingUser.rows.length > 0) {
                return createErrorResponse(
                    "This username is already taken",
                    409
                );
            }

            // Check if user already has a username
            const currentUser = await query(
                "SELECT username, is_username_set FROM users WHERE id = $1",
                [user!.id]
            );

            if (
                currentUser.rows[0]?.username &&
                currentUser.rows[0]?.is_username_set
            ) {
                return createErrorResponse(
                    "Username has already been set and cannot be changed",
                    400
                );
            }

            // Update username
            const result = await query(
                `UPDATE users 
                 SET username = $1, is_username_set = true
                 WHERE id = $2
                 RETURNING id, email, username, is_username_set`,
                [username, user!.id]
            );

            return NextResponse.json({
                ok: true,
                user: result.rows[0],
            });
        } catch (error: any) {
            console.error("Set username error:", error);
            return createErrorResponse("Server error", 500);
        }
    },
    { requireAuth: true }
);
