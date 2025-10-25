import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import { generateCheckoutUrl } from "@/lib/lemonSqueezy";

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();

        if (!user) {
            return createErrorResponse("Nie zalogowano", 401);
        }

        const { variantId } = await req.json();

        if (!variantId) {
            return createErrorResponse("Brak variant ID", 400);
        }

        // Generuj URL checkout przez API (async)
        const checkoutUrl = await generateCheckoutUrl(
            variantId,
            user.email,
            user.id
        );

        return NextResponse.json({
            ok: true,
            checkoutUrl,
        });
    } catch (error: any) {
        console.error("Create checkout error:", error);
        return createErrorResponse(
            error.message || "Błąd tworzenia checkout",
            500
        );
    }
}
