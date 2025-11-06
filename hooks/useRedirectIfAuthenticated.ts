import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "./useAuthUser";

/**
 * Hook do przekierowania zalogowanych użytkowników
 * Używany na stronach publicznych (login, register, home)
 */
export function useRedirectIfAuthenticated(redirectTo: string = "/dashboard") {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuthUser();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push(redirectTo);
        }
    }, [loading, isAuthenticated, router, redirectTo]);

    return { checking: loading };
}
