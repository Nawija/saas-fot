import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook do przekierowania zalogowanych użytkowników
 * Używany na stronach publicznych (login, register, home)
 */
export function useRedirectIfAuthenticated(redirectTo: string = "/dashboard") {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/user/me");
                if (res.ok) {
                    router.push(redirectTo);
                }
            } catch (error) {
                // User not logged in, that's fine
            } finally {
                setChecking(false);
            }
        };

        void checkAuth();
    }, [router, redirectTo]);

    return { checking };
}
