# 🖼️ Zarządzanie Awatarami - Dokumentacja

## Przegląd

System automatycznego przetwarzania i przechowywania awatarów użytkowników w Cloudflare R2.

## Funkcjonalności

### ✅ Automatyczne przetwarzanie obrazu

-   **Resize**: Zmiana rozmiaru do 200x200px
-   **Format**: Konwersja do WebP dla lepszej kompresji
-   **Jakość**: Optymalizacja do 80% jakości
-   **Rozmiar**: Maksymalnie 5MB dla przesyłanego pliku

### ✅ Przechowywanie w Cloudflare R2

-   Automatyczne przesyłanie do bucket
-   Publiczny dostęp przez R2 Public Domain
-   Automatyczne usuwanie starych awatarów
-   Unikalne nazwy plików

### ✅ Interfejs użytkownika

-   Szybka zmiana przez dropdown menu
-   Pełny interfejs w ustawieniach profilu
-   Podgląd aktualnego avatara
-   Możliwość usunięcia avatara

## Struktura plików

```
lib/
├── r2.ts                    # Klient R2 i operacje
├── imageProcessor.ts        # Przetwarzanie obrazów

app/api/user/avatar/
└── route.ts                # API endpoints (POST, DELETE)

components/buttons/
├── ChangeAvatar.tsx         # Pełny komponent z przyciskami
└── ChangeAvatarMenuItem.tsx # Prosty komponent do menu

app/dashboard/profile/
└── page.tsx                # Strona ustawień profilu
```

## Konfiguracja R2

### Zmienne środowiskowe (`.env`):

```env
R2_ENDPOINT=https://95bf0ea1ff3bf7c1d0f1a5a869233860.r2.cloudflarestorage.com
R2_BUCKET=foto
R2_ACCESS_KEY_ID=91cd868bf433980b3755aba87044e3a1
R2_SECRET_ACCESS_KEY=cf55eff6fad73606cdd146044ff815a031a85551c0e8e584f23e354bf4baf622
R2_REGION=auto
NEXT_PUBLIC_R2_PUBLIC_DOMAIN=https://pub-53d7668c089b405c91c4867c026d81b0.r2.dev
```

### Instalacja zależności:

```bash
npm install @aws-sdk/client-s3 sharp
```

## API Endpoints

### `POST /api/user/avatar`

Przesyła i przetwarza nowy avatar.

**Request**:

-   Content-Type: `multipart/form-data`
-   Body: `avatar` (File)

**Proces**:

1. Walidacja użytkownika (musi być zalogowany)
2. Walidacja typu pliku (JPG, PNG, WEBP, GIF)
3. Walidacja rozmiaru (max 5MB)
4. Przetworzenie obrazu (resize + WebP)
5. Usunięcie starego avatara z R2
6. Przesłanie nowego do R2
7. Aktualizacja URL w bazie danych

**Response Success (200)**:

```json
{
    "ok": true,
    "avatarUrl": "https://pub-xxx.r2.dev/avatars/user-123-1234567890.webp",
    "message": "Avatar został zaktualizowany"
}
```

**Response Error**:

```json
{
    "error": "Komunikat błędu"
}
```

### `DELETE /api/user/avatar`

Usuwa avatar użytkownika.

**Request**: Brak body

**Proces**:

1. Walidacja użytkownika
2. Sprawdzenie czy ma avatar
3. Usunięcie z R2
4. Usunięcie URL z bazy danych

**Response Success (200)**:

```json
{
    "ok": true,
    "message": "Avatar został usunięty"
}
```

## Przetwarzanie obrazu

### Parametry (`lib/imageProcessor.ts`):

```typescript
const AVATAR_SIZE = 200; // Rozmiar w pikselach
const AVATAR_QUALITY = 80; // Jakość kompresji (0-100)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
```

### Proces:

1. **Walidacja rozmiaru**: Sprawdza czy plik nie przekracza 5MB
2. **Resize**: Zmienia rozmiar do 200x200px z `fit: "cover"`
3. **Format**: Konwertuje do WebP
4. **Kompresja**: Optymalizuje jakość do 80%
5. **Output**: Zwraca przetworzone dane

### Obsługiwane formaty wejściowe:

-   JPEG / JPG
-   PNG
-   WEBP
-   GIF

### Format wyjściowy:

-   **WebP** - nowoczesny format z lepszą kompresją

## Przechowywanie w R2

### Struktura ścieżek:

```
avatars/
├── user-1-1234567890.webp
├── user-2-1234567891.webp
└── user-3-1234567892.webp
```

### Nazewnictwo:

-   Pattern: `user-{userId}-{timestamp}.webp`
-   Przykład: `user-123-1698765432.webp`
-   Timestamp zapewnia unikalność

### Publiczny dostęp:

-   Wszystkie pliki dostępne przez `NEXT_PUBLIC_R2_PUBLIC_DOMAIN`
-   Przykład URL: `https://pub-xxx.r2.dev/avatars/user-123-xxx.webp`

## Komponenty React

### `ChangeAvatar.tsx` - Pełny interfejs

**Props**:

```typescript
interface ChangeAvatarProps {
    currentAvatar?: string | null;
}
```

**Funkcje**:

-   Przycisk "Zmień avatar" z ikoną
-   Przycisk "Usuń" (tylko jeśli avatar istnieje)
-   Loading states
-   Walidacja po stronie klienta
-   Wyświetlanie błędów
-   Auto-refresh po zmianie

### `ChangeAvatarMenuItem.tsx` - Prosty menu item

**Funkcje**:

-   Minimalistyczny interfejs
-   Ukryty input file
-   Podstawowa walidacja
-   Alert dla błędów

## Bezpieczeństwo

### ✅ Walidacje:

1. **Server-side**:

    - Autoryzacja użytkownika
    - Typ pliku (MIME type)
    - Rozmiar pliku (max 5MB)
    - Przetwarzanie przez Sharp (dodatkowa walidacja)

2. **Client-side**:

    - Rozmiar pliku
    - Typ pliku (accept="image/\*")
    - Komunikaty błędów

3. **Storage**:
    - Unikalne nazwy plików (timestamp)
    - Automatyczne usuwanie starych plików
    - HttpOnly access do R2 credentials

## Przepływ użytkownika

### Zmiana avatara:

```
1. Użytkownik klika "Zmień avatar"
   ↓
2. Wybiera plik z dysku
   ↓
3. Walidacja po stronie klienta
   ↓
4. Przesłanie do API
   ↓
5. Przetworzenie obrazu (resize + WebP)
   ↓
6. Usunięcie starego z R2
   ↓
7. Przesłanie nowego do R2
   ↓
8. Aktualizacja w bazie danych
   ↓
9. Refresh strony → nowy avatar widoczny
```

### Usunięcie avatara:

```
1. Użytkownik klika "Usuń"
   ↓
2. Potwierdzenie (confirm dialog)
   ↓
3. Wywołanie DELETE /api/user/avatar
   ↓
4. Usunięcie z R2
   ↓
5. Usunięcie URL z bazy danych
   ↓
6. Refresh strony → domyślny avatar
```

## Baza danych

### Pole `avatar` w tabeli `users`:

```sql
avatar TEXT NULL
```

**Wartości**:

-   `NULL` - brak własnego avatara (użyj domyślnego)
-   `"https://pub-xxx.r2.dev/avatars/user-123-xxx.webp"` - URL do R2

## Optymalizacja

### Dlaczego WebP?

-   **Mniejszy rozmiar**: 25-35% mniej niż JPEG/PNG
-   **Lepsza jakość**: Przy tym samym rozmiarze
-   **Szeroka kompatybilność**: Obsługa przez wszystkie nowoczesne przeglądarki
-   **Szybsze ładowanie**: Mniejsze pliki = szybszy transfer

### Statystyki:

| Format | Rozmiar (typowy) | Jakość       |
| ------ | ---------------- | ------------ |
| JPEG   | 50-80 KB         | Dobra        |
| PNG    | 100-150 KB       | Dobra        |
| WebP   | 20-40 KB         | Bardzo dobra |

### Cache:

```typescript
// Avatar URL w komponencie Avatar z shadcn/ui
<AvatarImage src={avatarUrl} alt={displayName} />
```

## Obsługa błędów

### Możliwe błędy:

| Kod | Błąd                      | Przyczyna                  |
| --- | ------------------------- | -------------------------- |
| 400 | "Brak pliku"              | Nie przesłano pliku        |
| 400 | "Nieprawidłowy typ pliku" | Nie jest obrazem           |
| 400 | "Plik jest za duży"       | Przekroczono 5MB           |
| 401 | "Nie zalogowano"          | Brak tokena/sesji          |
| 500 | "Błąd przetwarzania"      | Sharp nie mógł przetworzyć |
| 500 | "Błąd przesyłania"        | Problemy z R2              |

## Testowanie

### Test 1: Upload avatara

1. Zaloguj się
2. Kliknij avatar → "Zmień avatar"
3. Wybierz obraz (JPEG/PNG)
4. Sprawdź czy avatar się zmienił
5. Sprawdź URL w bazie danych
6. Sprawdź plik w R2

### Test 2: Walidacja rozmiaru

1. Spróbuj przesłać plik > 5MB
2. Powinien pokazać błąd przed wysłaniem

### Test 3: Walidacja typu

1. Spróbuj przesłać plik PDF/TXT
2. Powinien pokazać błąd

### Test 4: Usunięcie avatara

1. Zaloguj się (musi mieć avatar)
2. Kliknij "Usuń"
3. Potwierdź
4. Avatar powinien wrócić do domyślnego

### Test 5: Podmiana avatara

1. Prześlij avatar1.jpg
2. Prześlij avatar2.jpg
3. Sprawdź czy avatar1.jpg został usunięty z R2

## Przyszłe ulepszenia

-   [ ] Crop tool przed przesłaniem
-   [ ] Wsparcie dla animowanych GIF
-   [ ] Preview przed zapisem
-   [ ] Galeria awatarów domyślnych
-   [ ] Historia zmian avatara
-   [ ] Kompresja do różnych rozmiarów (thumbnails)
-   [ ] CDN caching
-   [ ] Lazy loading avatarów
