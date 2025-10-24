interface SendCodeParams {
    email: string;
}

interface RegisterParams {
    email: string;
    password: string;
    code: string;
}

export const authService = {
    async sendVerificationCode({ email }: SendCodeParams): Promise<void> {
        const res = await fetch("/api/auth/send-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Błąd wysyłki maila");
        }
    },

    async register({ email, password, code }: RegisterParams): Promise<void> {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, code }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Błąd rejestracji");
        }
    },
};
