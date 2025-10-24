# 🔐 Zarządzanie Hasłami - Dokumentacja

## Rozwiązanie problemu z Google OAuth

### Problem

Użytkownicy logujący się przez Google nie mają hasła w bazie danych, więc opcja "Zmień hasło" nie powinna być dla nich dostępna.

### Rozwiązanie

#### 1. **Dodanie pola `provider` do profilu użytkownika**

W bazie danych mamy pole `provider` które może mieć wartości:

-   `"email"` - użytkownik zarejestrowany przez email
-   `"google"` - użytkownik zalogowany przez Google

#### 2. **Aktualizacja `getUser()` w `lib/auth/getUser.ts`**

```typescript
// Dodano pole 'provider' do zapytania
const res = await query(
    "SELECT id, email, avatar, name, provider FROM users WHERE id = $1",
    [payload.sub]
);
```

#### 3. **Warunkowe wyświetlanie w `UserDropdown`**

```tsx
{
    /* Opcja zmiany hasła tylko dla użytkowników z emailem */
}
{
    provider === "email" && (
        <DropdownMenuItem>
            <ChangePassword />
        </DropdownMenuItem>
    );
}
```

#### 4. **Walidacja na poziomie API**

**`/api/user/send-change-code/route.ts`**

```typescript
// Sprawdź czy użytkownik używa email (nie Google)
if (user.provider !== "email") {
    return createErrorResponse(
        "Zmiana hasła dostępna tylko dla kont z emailem",
        403
    );
}
```

**`/api/user/change-password/route.ts`**

```typescript
// Sprawdź czy użytkownik ma provider 'email'
if (user.provider !== "email") {
    return createErrorResponse(
        "Zmiana hasła dostępna tylko dla kont z emailem",
        403
    );
}
```

## Przepływ zmiany hasła

### Dla użytkowników z emailem (`provider: "email"`):

1. **Krok 1**: Kliknięcie "Zmień hasło" w dropdown
2. **Krok 2**: API wysyła kod weryfikacyjny na email
3. **Krok 3**: Przekierowanie do `/dashboard/u/reset-password`
4. **Krok 4**: Użytkownik wpisuje kod i nowe hasło
5. **Krok 5**: API weryfikuje kod i zmienia hasło

### Dla użytkowników Google (`provider: "google"`):

-   ❌ Przycisk "Zmień hasło" **nie jest wyświetlany**
-   ❌ Jeśli ktoś spróbuje bezpośrednio wywołać API, otrzyma błąd 403

## Bezpieczeństwo

### ✅ Wielopoziomowa ochrona:

1. **UI Level** - przycisk nie pojawia się dla użytkowników Google
2. **API Level** - walidacja providera przed wysłaniem kodu
3. **Database Level** - aktualizacja tylko dla użytkowników z `provider: "email"`

### ✅ Dodatkowe zabezpieczenia:

-   Kod weryfikacyjny ważny tylko 5 minut
-   Kod przechowywany w HttpOnly cookies
-   Walidacja długości hasła (minimum 6 znaków)
-   Potwierdzenie hasła (musi być takie samo)
-   Sprawdzenie czy email w kodzie zgadza się z zalogowanym użytkownikiem

## Typy użytkowników

| Provider | Metoda logowania | Hasło w DB | Może zmienić hasło |
| -------- | ---------------- | ---------- | ------------------ |
| `email`  | Email + Hasło    | ✅ Tak     | ✅ Tak             |
| `google` | Google OAuth     | ❌ Nie     | ❌ Nie             |

## Komponenty

### `UserDropdown.tsx`

```tsx
interface UserDropdownProps {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    provider?: string | null; // ⬅️ Nowy prop
}
```

### `ChangePassword.tsx`

-   Dodano obsługę błędów
-   Dodano stan ładowania
-   Dodano ikonę Key z lucide-react
-   Alert w przypadku błędu

## API Endpoints

### `POST /api/user/send-change-code`

**Działanie**: Wysyła kod weryfikacyjny na email użytkownika

**Walidacja**:

-   ✅ Użytkownik musi być zalogowany
-   ✅ Provider musi być "email"

**Odpowiedź**:

-   200: `{ ok: true }`
-   401: `{ error: "Nie zalogowano" }`
-   403: `{ error: "Zmiana hasła dostępna tylko dla kont z emailem" }`
-   500: `{ error: "Błąd wysyłki maila" }`

### `POST /api/user/change-password`

**Działanie**: Zmienia hasło użytkownika

**Body**:

```json
{
    "code": "123456",
    "newPassword": "nowehaslo123",
    "confirmPassword": "nowehaslo123"
}
```

**Walidacja**:

-   ✅ Wszystkie pola wymagane
-   ✅ Hasła muszą się zgadzać
-   ✅ Minimum 6 znaków
-   ✅ Kod musi być prawidłowy
-   ✅ Provider musi być "email"

**Odpowiedź**:

-   200: `{ ok: true, message: "Hasło zostało zmienione pomyślnie" }`
-   400: `{ error: "Walidacja" }`
-   401: `{ error: "Nieautoryzowany" }`
-   403: `{ error: "Zmiana hasła dostępna tylko dla kont z emailem" }`
-   500: `{ error: "Błąd serwera" }`

## Testowanie

### Test 1: Użytkownik z emailem

1. Zaloguj się jako użytkownik email
2. Kliknij avatar → powinien być przycisk "Zmień hasło"
3. Kliknij "Zmień hasło" → powinien wysłać kod
4. Wpisz kod i nowe hasło → powinno się zmienić

### Test 2: Użytkownik Google

1. Zaloguj się przez Google
2. Kliknij avatar → **nie** powinno być przycisku "Zmień hasło"
3. (Opcjonalnie) Spróbuj wywołać API bezpośrednio → powinien zwrócić 403

## Przyszłe ulepszenia

-   [ ] Dodać możliwość ustawienia hasła dla kont Google (upgrade do email)
-   [ ] Historia zmian hasła
-   [ ] Wymuszanie silnych haseł (regex)
-   [ ] Powiadomienie email po zmianie hasła
-   [ ] Rate limiting dla wysyłania kodów
