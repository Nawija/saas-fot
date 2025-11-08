import { useAuthContext } from "@/lib/auth/AuthContext";

/**
 * Hook do pobierania danych zalogowanego użytkownika
 * Teraz korzysta z AuthContext - fetch wykonuje się tylko RAZ przy starcie aplikacji!
 * Oszczędza zapytania do bazy i zmniejsza koszty utrzymania SaaS.
 */
export function useAuthUser() {
    return useAuthContext();
}
