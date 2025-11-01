import { NextResponse } from "next/server";
import { withMiddleware } from "@/lib/utils/apiMiddleware";

export const GET = withMiddleware(
    async (req, { user }) => {
        return NextResponse.json({ ok: true, user });
    },
    { requireAuth: true }
);
