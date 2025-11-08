"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

interface User {
    id: number;
    email: string;
    username?: string;
    name?: string;
    avatar?: string;
    is_username_set: boolean;
    provider: "email" | "google";
    subscription_plan: "free" | "basic" | "pro" | "unlimited";
    subscription_status: "active" | "cancelled" | "expired" | null;
    storage_used: number;
    storage_limit: number;
    lemon_squeezy_customer_id?: string;
    lemon_squeezy_subscription_id?: string;
    subscription_ends_at?: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: Error | null;
    isAuthenticated: boolean;
    refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchUser = async () => {
        try {
            setLoading(true);
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
                err instanceof Error ? err : new Error("Failed to fetch user")
            );
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch only once when provider mounts
        fetchUser();
    }, []);

    const refetchUser = async () => {
        await fetchUser();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                isAuthenticated: user !== null,
                refetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within AuthProvider");
    }
    return context;
}
