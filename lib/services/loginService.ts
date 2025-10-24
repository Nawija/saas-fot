interface LoginParams {
    email: string;
    password: string;
}

interface LoginResponse {
    ok: boolean;
    user?: {
        id: number;
        email: string;
    };
}

export const loginService = {
    async login({ email, password }: LoginParams): Promise<LoginResponse> {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Błąd logowania");
        }

        return data;
    },

    redirectToGoogleLogin() {
        window.location.href = "/api/auth/google/start";
    },
};
