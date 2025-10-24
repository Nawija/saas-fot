interface ApiError {
    error: string;
}

interface ApiSuccess<T = any> {
    ok: true;
    data?: T;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

export function createErrorResponse(message: string, status: number = 400) {
    return Response.json({ error: message }, { status });
}

export function createSuccessResponse<T>(data?: T, status: number = 200) {
    return Response.json({ ok: true, ...(data && { data }) }, { status });
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isStrongPassword(password: string): boolean {
    return password.length >= 6;
}
