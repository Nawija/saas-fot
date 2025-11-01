# Refaktoryzacja API według zasady DRY (Don't Repeat Yourself)

## Zmiany globalne

### 1. Nowe middleware i helpery (`/lib/utils/`)

#### `apiMiddleware.ts`

-   **`withAuth()`** - automatyczna autoryzacja użytkownika
-   **`withErrorHandling()`** - centralna obsługa błędów
-   **`withParams()`** - walidacja parametrów route
-   **`withMiddleware()`** - kombinator łączący wszystkie middleware

**Przykład użycia:**

```typescript
export const GET = withMiddleware(
    async (req, { user, params }) => {
        // user jest już sprawdzony i dostępny
        // params są już rozpakowane z Promise
        return NextResponse.json({ data: user });
    },
    { requireAuth: true, requiredParams: ["id"] }
);
```

#### `userHelpers.ts`

Centralizuje operacje związane z użytkownikiem:

-   **`getUserPlan(userId)`** - pobiera plan subskrypcji
-   **`hasPremiumAccess(plan)`** - sprawdza dostęp do premium
-   **`canCreateGallery(userId)`** - sprawdza limit galerii
-   **`canUploadFile(userId, fileSize)`** - sprawdza limit storage
-   **`updateUserStorage(userId, sizeDelta)`** - aktualizuje storage
-   **`isCollectionOwner(collectionId, userId)`** - weryfikuje właściciela
-   **`getCollectionForUser(collectionId, userId)`** - pobiera kolekcję z weryfikacją
-   **`getUserCollections(userId)`** - pobiera wszystkie kolekcje użytkownika

#### `passwordHelpers.ts`

Centralizuje operacje na hasłach:

-   **`hashPassword(password)`** - hashuje hasło
-   **`comparePassword(password, hash)`** - porównuje hasło z hashem
-   **`isValidPassword(password)`** - waliduje hasło
-   **`hashCollectionPassword(password)`** - hashuje hasło kolekcji (może zwrócić null)

#### `imageValidation.ts`

Centralizuje walidację obrazów:

-   **`isValidImageType(mimeType)`** - sprawdza typ MIME
-   **`isValidImageExtension(filename)`** - sprawdza rozszerzenie
-   **`validateImage(file, maxSize)`** - kompleksowa walidacja
-   **`getExtensionFromMimeType(mimeType)`** - konwersja MIME -> rozszerzenie
-   **`sanitizeFilename(filename)`** - bezpieczna nazwa pliku

## Zrefaktoryzowane pliki API

### `/api/collections/route.ts`

**Przed:**

-   ~150 linii
-   Powtarzająca się autoryzacja
-   Duplikacja logiki planów
-   Try-catch w każdej funkcji

**Po:**

-   ~80 linii (-47%)
-   Middleware obsługuje autoryzację
-   Helpery obsługują logikę planów
-   Centralna obsługa błędów

### `/api/collections/[id]/route.ts`

**Przed:**

-   ~300+ linii
-   Trzykrotna autoryzacja (GET, DELETE, PATCH)
-   Powtarzająca się walidacja planów
-   Duplikacja sprawdzania właściciela

**Po:**

-   ~150 linii (-50%)
-   Middleware obsługuje wszystko
-   Helpery centralizują logikę
-   Czytelniejszy kod

### `/api/user/me/route.ts`

**Przed:**

-   ~10 linii
-   Własna autoryzacja

**Po:**

-   ~6 linii (-40%)
-   Middleware obsługuje autoryzację

## Korzyści

### 1. **Mniej kodu**

-   Zmniejszenie o 40-50% linii kodu w API routes
-   Łatwiejsze utrzymanie
-   Mniej miejsc na błędy

### 2. **Jednolita obsługa**

-   Wszystkie błędy obsługiwane tak samo
-   Spójna autoryzacja
-   Jednolite formaty odpowiedzi

### 3. **Łatwiejsze testowanie**

-   Helpery można testować osobno
-   Middleware można testować niezależnie
-   API routes są prostsze do testów

### 4. **Lepsza czytelność**

-   Kod biznesowy oddzielony od infrastruktury
-   Intencje są jasne
-   Łatwiejsze onboardowanie nowych developerów

### 5. **Reużywalność**

-   Helpery można używać w wielu miejscach
-   Middleware można komponować
-   Logika biznesowa w jednym miejscu

## Przykład migracji

### Przed:

```typescript
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await query(
            "SELECT * FROM collections WHERE id = $1 AND user_id = $2",
            [id, user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
```

### Po:

```typescript
export const GET = withMiddleware(
    async (req, { user, params }) => {
        const collection = await getCollectionForUser(params.id, user!.id);

        if (!collection) {
            return createErrorResponse("Not found", 404);
        }

        return NextResponse.json(collection);
    },
    { requireAuth: true, requiredParams: ["id"] }
);
```

## Następne kroki

Aby kontynuować refaktoryzację:

1. **Migruj pozostałe API routes:**

    - `/api/user/*`
    - `/api/billing/*`
    - `/api/gallery/*`
    - `/api/auth/*`

2. **Dodaj więcej helperów:**

    - Email validation i sending
    - File upload helpers
    - Database transaction helpers

3. **Rozszerz middleware:**

    - Rate limiting
    - Request logging
    - Caching

4. **Dodaj testy:**
    - Unit testy dla helperów
    - Integration testy dla middleware
    - E2E testy dla API

## Zgodność wsteczna

Wszystkie zmiany są w pełni zgodne wstecz:

-   API endpoints nie zmieniły się
-   Formaty odpowiedzi są takie same
-   Klienci nie wymagają zmian
