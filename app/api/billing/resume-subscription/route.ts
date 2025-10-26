import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );

        const { subscriptionId } = await req.json();
        if (
            !subscriptionId ||
            subscriptionId !== user.lemon_squeezy_subscription_id
        ) {
            return NextResponse.json(
                { error: "Invalid subscription" },
                { status: 400 }
            );
        }

        const res = await fetch(
            `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
            {
                method: "PATCH",
                headers: {
                    Accept: "application/vnd.api+json",
                    "Content-Type": "application/vnd.api+json",
                    Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
                },
                body: JSON.stringify({
                    data: {
                        type: "subscriptions",
                        id: subscriptionId,
                        attributes: { cancelled: false },
                    },
                }),
            }
        );

        if (!res.ok) {
            const err = await res.text();
            console.error("Lemon resume error:", err);
            return NextResponse.json(
                { error: "Resume failed" },
                { status: 400 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("Resume API error:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
