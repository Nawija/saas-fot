# Auth Context - Optymalizacja zapytań do bazy danych

## Problem

Każdy komponent/strona, która potrzebowała danych użytkownika, wykonywała własne zapytanie do `/api/user/me`. To generowało niepotrzebne obciążenie bazy danych i zwiększało koszty utrzymania aplikacji SaaS.

## Rozwiązanie

Implementacja **React Context** + globalnego hooka `useAuthUser()`, który:

-   Wykonuje fetch **tylko raz** przy starcie aplikacji
-   Współdzieli dane użytkownika między wszystkimi komponentami
-   Drastycznie zmniejsza ilość zapytań do bazy danych

## Struktura

### 1. AuthContext Provider (`lib/auth/AuthContext.tsx`)

```tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch wykonuje się TYLKO RAZ przy montowaniu providera
    fetch("/api/user/me").then(...)
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 2. Hook `useAuthUser()` (`hooks/useAuthUser.ts`)

```tsx
export function useAuthUser() {
    return useAuthContext(); // Pobiera dane z contextu zamiast fetchować
}
```

### 3. ClientProviders wrapper (`components/ClientProviders.tsx`)

```tsx
"use client";
export function ClientProviders({ children }) {
    return <AuthProvider>{children}</AuthProvider>;
}
```

### 4. Montowanie w `app/layout.tsx`

```tsx
import { ClientProviders } from "@/components/ClientProviders";

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <ClientProviders>
                    <main>{children}</main>
                </ClientProviders>
            </body>
        </html>
    );
}
```

## Użycie w komponentach

### ❌ Przed (każdy komponent robi własny fetch)

```tsx
export default function MyPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/me")
            .then((res) => res.json())
            .then((data) => {
                setUser(data.user);
                setLoading(false);
            });
    }, []);

    // ...
}
```

### ✅ Po (korzysta z współdzielonego contextu)

```tsx
import { useAuthUser } from "@/hooks/useAuthUser";

export default function MyPage() {
    const { user, loading, isAuthenticated } = useAuthUser();

    // Dane są już dostępne z contextu - ZERO dodatkowych zapytań!
}
```

## Zaktualizowane pliki

### Strony/komponenty z własnym fetchem → useAuthUser():

-   ✅ `app/dashboard/page.tsx`
-   ✅ `app/dashboard/billing/page.tsx`
-   ✅ `app/dashboard/collections/new/page.tsx`
-   ✅ `app/dashboard/u/reset-password/page.tsx`

### Hooki używające `/api/user/me` → useAuthUser():

-   ✅ `hooks/useCollectionData.ts`
-   ✅ `hooks/useCollections.ts`

## Korzyści

### 1. **Dramatyczne zmniejszenie zapytań do bazy**

-   **Przed**: Każda strona = 1 zapytanie → przy 10 stronach = **10 zapytań**
-   **Po**: Cała aplikacja = 1 zapytanie → **90% mniej obciążenia bazy**

### 2. **Niższe koszty utrzymania SaaS**

-   Mniej zapytań = mniej obciążenia serwera
-   Mniej zużycia połączeń do bazy danych
-   Niższe rachunki za hosting/database

### 3. **Szybsza aplikacja**

-   Dane użytkownika dostępne natychmiast w każdym komponencie
-   Brak opóźnień związanych z fetchowaniem
-   Płynniejsze przejścia między stronami

### 4. **Łatwiejszy development**

-   Jeden hook do zarządzania użytkownikiem w całej aplikacji
-   Możliwość `refetchUser()` po zmianach (np. po aktualizacji profilu)
-   Centralne miejsce do debugowania auth

## API

```tsx
const {
    user, // Obiekt User | null
    loading, // boolean - czy trwa pobieranie
    error, // Error | null
    isAuthenticated, // boolean - czy użytkownik zalogowany
    refetchUser, // () => Promise<void> - wymusza ponowne pobranie
} = useAuthUser();
```

## Przykłady użycia

### Conditional rendering

```tsx
const { user, loading } = useAuthUser();

if (loading) return <Loading />;
if (!user) return <LoginPrompt />;

return <DashboardContent user={user} />;
```

### Wymuszenie odświeżenia po update

```tsx
const { user, refetchUser } = useAuthUser();

async function handleUpdateProfile() {
  await fetch("/api/user/update", { method: "POST", ... });
  await refetchUser(); // Odśwież dane użytkownika w kontekście
}
```

## Bezpieczeństwo

-   Dane użytkownika są pobierane z backendu przez API route `/api/user/me`
-   Backend weryfikuje session/token przed zwróceniem danych
-   Context tylko **współdzieli** już pobrane i zweryfikowane dane
-   Nie przechowujemy wrażliwych danych (hasła, tokeny) w contexcie

## Notatki

-   Context jest client-side (`"use client"`)
-   Provider jest zamontowany w `ClientProviders` i owrapowany w `app/layout.tsx`
-   Wszystkie komponenty używające `useAuthUser()` muszą być potomkami `AuthProvider`
-   Fetch wykonuje się **tylko raz** przy pierwszym ładowaniu aplikacji
