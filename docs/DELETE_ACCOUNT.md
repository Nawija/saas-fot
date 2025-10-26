# Usuwanie Konta - Dokumentacja

## Przegląd

Funkcja całkowitego usuwania konta użytkownika wraz z wszystkimi powiązanymi danymi.

## Proces Usuwania

### 1. Anulowanie Subskrypcji

-   Jeśli użytkownik ma aktywną subskrypcję w Lemon Squeezy, zostanie ona automatycznie anulowana
-   API: `DELETE /v1/subscriptions/{subscription_id}`
-   Błąd anulowania nie blokuje dalszego procesu usuwania

### 2. Usuwanie Plików z R2

Wszystkie pliki użytkownika są usuwane z R2 bucket:

-   Avatar: `users/{userId}/avatar/profile.jpg`
-   Zdjęcia kolekcji: `users/{userId}/collections/{collectionId}/photos/{photoId}.{ext}`
-   Obrazy hero kolekcji: `users/{userId}/collections/{collectionId}/hero.jpg`

### 3. Usuwanie z Bazy Danych

Dzięki `ON DELETE CASCADE` wystarczy usunąć użytkownika:

```sql
DELETE FROM users WHERE id = $userId
```

Automatycznie usuwa:

-   `photos` - wszystkie zdjęcia użytkownika
-   `collections` - wszystkie kolekcje
-   `password_reset_codes` - kody resetowania hasła
-   `photo_likes` - polubienia (przez CASCADE na photos)

### 4. Wylogowanie

-   Usunięcie tokena JWT z cookies
-   Użytkownik zostaje przekierowany na stronę główną

## Implementacja

### Backend API

**Endpoint**: `POST /api/user/delete-account`

**Auth**: Wymagany (JWT token)

**Response**:

```json
{
    "success": true,
    "message": "Konto zostało całkowicie usunięte"
}
```

### UI Component

**Komponent**: `DeleteAccountButton`

**Lokalizacja**: `/dashboard/profile`

**Funkcje**:

-   Wizualne ostrzeżenie (czerwony banner)
-   Lista wszystkich usuwanych danych
-   Dialog potwierdzenia z jasnym komunikatem o nieodwracalności
-   Toast z informacją o sukcesie
-   Automatyczne przekierowanie na homepage

## Ostrzeżenia

⚠️ **NIEODWRACALNE** - Nie ma możliwości odzyskania danych

⚠️ **TRWAŁE USUNIĘCIE**:

-   Wszystkie zdjęcia i kolekcje
-   Galerie publiczne i linki
-   Historia płatności
-   Aktywna subskrypcja
-   Dane profilu i avatar

## Bezpieczeństwo

✅ Wymagana autoryzacja (JWT token)
✅ Potwierdzenie w UI (confirmation dialog)
✅ Logi dla audytu
✅ Graceful error handling (kontynuacja mimo błędów częściowych)

## Testowanie

### Scenariusz Testowy:

1. Utwórz konto testowe
2. Dodaj kolekcje z zdjęciami
3. Opcjonalnie: Wykup subskrypcję testową
4. Przejdź do `/dashboard/profile`
5. Scroll na dół do "Strefa niebezpieczna"
6. Kliknij "Usuń konto na zawsze"
7. Potwierdź w dialogu

### Weryfikacja:

-   [ ] Pliki usunięte z R2
-   [ ] Rekordy usunięte z bazy
-   [ ] Subskrypcja anulowana (jeśli była)
-   [ ] Token usunięty (wylogowanie)
-   [ ] Przekierowanie na homepage

## Kod

### Pliki:

-   `/app/api/user/delete-account/route.ts` - API endpoint
-   `/components/buttons/DeleteAccountButton.tsx` - UI komponent
-   `/lib/r2.ts` - funkcja `deleteUserFolder()`
-   `/app/dashboard/profile/page.tsx` - integracja w profilu

### Funkcje pomocnicze:

```typescript
// lib/r2.ts
export async function deleteUserFolder(userId: string): Promise<void>;

// Usuwa wszystkie obiekty w folderze users/{userId}/
```

## Logi

Wszystkie kroki są logowane dla celów debugowania:

```
[Delete Account] Starting deletion for user: {userId}
[Delete Account] Cancelling subscription: {subscriptionId}
[Delete Account] Deleting R2 files for user: {userId}
[Delete Account] Deleting database records for user: {userId}
[Delete Account] Successfully deleted account: {userId}
```
