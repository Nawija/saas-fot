import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { createErrorResponse } from "./apiHelpers";

export type AuthenticatedUser = {
    id: string;
    email: string;
    name?: string;
    subscription_plan?: string;
};

export type ApiContext = {
    user: AuthenticatedUser | null;
    params?: any;
};

export type ApiHandler = (
    req: NextRequest,
    context: ApiContext
) => Promise<Response>;

/**
 * Middleware do wymagania uwierzytelnienia
 */
export function withAuth(handler: ApiHandler): ApiHandler {
    return async (req: NextRequest, context: ApiContext) => {
        try {
            const user = await getUser();
            if (!user) {
                return createErrorResponse("Nie zalogowano", 401);
            }

            return await handler(req, { ...context, user });
        } catch (error) {
            console.error("Auth middleware error:", error);
            return createErrorResponse("Błąd autoryzacji", 500);
        }
    };
}

/**
 * Middleware do obsługi błędów
 */
export function withErrorHandling(handler: ApiHandler): ApiHandler {
    return async (req: NextRequest, context: ApiContext) => {
        try {
            return await handler(req, context);
        } catch (error: any) {
            console.error("API Error:", error);
            return createErrorResponse(
                error.message || "Wystąpił błąd serwera",
                error.status || 500
            );
        }
    };
}

/**
 * Middleware do walidacji parametrów route
 */
export function withParams(
    requiredParams: string[] = []
): (
    handler: ApiHandler
) => (
    req: NextRequest,
    routeContext?: { params: Promise<any> }
) => Promise<Response> {
    return (handler: ApiHandler) => {
        return async (
            req: NextRequest,
            routeContext?: { params: Promise<any> }
        ) => {
            try {
                const params = routeContext?.params
                    ? await routeContext.params
                    : {};

                // Walidacja wymaganych parametrów
                for (const param of requiredParams) {
                    if (!params[param]) {
                        return createErrorResponse(
                            `Brakujący parametr: ${param}`,
                            400
                        );
                    }
                }

                return await handler(req, { user: null, params });
            } catch (error) {
                console.error("Params middleware error:", error);
                return createErrorResponse("Błąd walidacji parametrów", 500);
            }
        };
    };
}

/**
 * Kombinator middleware - łączy auth, error handling i params
 */
export function withMiddleware(
    handler: ApiHandler,
    options: {
        requireAuth?: boolean;
        requiredParams?: string[];
    } = {}
) {
    let wrappedHandler = handler;

    // Dodaj autentykację
    if (options.requireAuth) {
        wrappedHandler = withAuth(wrappedHandler);
    }

    // Dodaj error handling
    wrappedHandler = withErrorHandling(wrappedHandler);

    // Dodaj walidację parametrów jeśli potrzeba
    if (options.requiredParams?.length) {
        return withParams(options.requiredParams)(wrappedHandler);
    }

    return async (
        req: NextRequest,
        routeContext?: { params: Promise<any> }
    ) => {
        const params = routeContext?.params
            ? await routeContext.params
            : undefined;
        return wrappedHandler(req, { user: null, params });
    };
}
