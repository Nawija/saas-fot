import { useEffect, useState } from "react";

interface User {
    id: string;
    email: string;
    username?: string;
    is_username_set: boolean;
    // add other user fields as needed
}

interface UseAuthUserReturn {
    user: User | null;
    loading: boolean;
    error: Error | null;
    isAuthenticated: boolean;
}

/**
 * Hook do pobierania danych zalogowanego użytkownika
 * Wykonuje fetch tylko raz przy montowaniu komponentu
 */
export function useAuthUser(): UseAuthUserReturn {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/user/me", {
                    cache: "no-store",
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error("Failed to fetch user")
                );
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return {
        user,
        loading,
        error,
        isAuthenticated: user !== null,
    };
}
