# DEBUG LEMON SQUEEZY WEBHOOKS

## Problem

Po zapłaceniu w Lemon Squeezy plan nie jest aktualizowany w bazie danych.

## Zmiany wprowadzone

### 1. Naprawiono pobieranie `user_id` w webhook

**Plik:** `app/api/webhooks/lemon-squeezy/route.ts`

-   Najpierw próbuje pobrać `user_id` z `custom_data` (przekazywane podczas checkout)
-   Jeśli nie ma, próbuje znaleźć użytkownika po `customer_id` z bazy
-   Dodano szczegółowe logowanie każdego kroku

### 2. Naprawiono `handlePaymentSuccess`

**Plik:** `app/api/webhooks/lemon-squeezy/route.ts`

Teraz aktualizuje:

-   `subscription_plan` (basic/pro/unlimited)
-   `storage_limit` (na podstawie planu)
-   `subscription_status` ('active')
-   `lemon_squeezy_customer_id`

### 3. Dodano szczegółowe logowanie

**Pliki:**

-   `app/api/webhooks/lemon-squeezy/route.ts`
-   `lib/lemonSqueezy.ts`

Każdy handler loguje:

-   Otrzymane dane
-   Zmapowany plan
-   Rezultat zapisu do bazy
-   Czy użytkownik został zaktualizowany

### 4. Naprawiono typ `userId` w `generateCheckoutUrl`

**Plik:** `lib/lemonSqueezy.ts`

Zmieniono typ z `number` na `string | number` bo w bazie używasz UUID.

---

## Jak przetestować

### Opcja 1: Test lokalny z skryptem

1. **Uruchom dev server:**

    ```bash
    npm run dev
    ```

2. **W drugim terminalu, edytuj skrypt testowy:**

    ```bash
    notepad scripts/test-webhook-debug.js
    ```

3. **Wstaw swoje dane:**

    - `USER_ID` - UUID użytkownika z bazy (kolumna `users.id`)
    - `WEBHOOK_SECRET` - Twój secret z `.env.local`
    - `VARIANT_ID` - ID wariantu z Lemon Squeezy

4. **Uruchom test:**

    ```bash
    node scripts/test-webhook-debug.js
    ```

5. **Sprawdź logi w terminalu dev servera** - zobaczysz:
    ```
    [Webhook subscription_payment_success] Received payload: {...}
    [mapVariantToPlan] Variant ID: 123456 -> Plan: pro
    [handlePaymentSuccess] User: xxx, Plan: pro, Storage: 107374182400, Customer: 67890
    [handlePaymentSuccess] ✅ Updated user: {...}
    ```

### Opcja 2: Test z prawdziwą płatnością

1. **Sprawdź czy masz ustawione zmienne środowiskowe:**

    ```env
    LEMON_SQUEEZY_WEBHOOK_SECRET=xxx
    NEXT_PUBLIC_LS_VARIANT_BASIC=123456
    NEXT_PUBLIC_LS_VARIANT_PRO=123457
    NEXT_PUBLIC_LS_VARIANT_UNLIMITED=123458
    ```

2. **Dokonaj testowej płatności** przez Lemon Squeezy

3. **Sprawdź logi aplikacji** - powinny pokazać:

    - Otrzymanie webhooka
    - Znalezienie użytkownika
    - Mapowanie variant_id na plan
    - Aktualizację bazy danych

4. **Sprawdź bazę danych:**
    ```sql
    SELECT
        id,
        email,
        subscription_plan,
        subscription_status,
        storage_limit,
        lemon_squeezy_customer_id,
        lemon_squeezy_subscription_id
    FROM users
    WHERE email = 'twoj-email@example.com';
    ```

---

## Co sprawdzić jeśli dalej nie działa

### 1. Sprawdź czy webhook otrzymuje `user_id`

W logach szukaj:

```
[Webhook subscription_payment_success] Received payload: {...}
```

Sprawdź czy `custom_data.user_id` jest obecny w payloadzie.

### 2. Sprawdź mapowanie variant_id

W logach szukaj:

```
[mapVariantToPlan] Variant ID: 123456 -> Plan: pro
[mapVariantToPlan] Available mappings: { basic: '123456', pro: '123457', ... }
```

-   Czy `variant_id` z webhooka pasuje do zmiennych środowiskowych?
-   Czy zmienne `NEXT_PUBLIC_LS_VARIANT_*` są ustawione?

### 3. Sprawdź czy użytkownik istnieje

Jeśli widzisz:

```
[Webhook] ❌ No user_id found in custom_data or customer_id mapping
```

To znaczy, że:

-   `custom_data.user_id` nie został przekazany podczas checkout
-   LUB użytkownik nie ma ustawionego `lemon_squeezy_customer_id`

### 4. Sprawdź czy update się wykonał

Jeśli widzisz:

```
[handlePaymentSuccess] ❌ No user updated! Check if userId exists in database.
```

To znaczy, że:

-   `userId` z webhooka nie istnieje w bazie
-   LUB query się nie wykonało (sprawdź połączenie z bazą)

### 5. Sprawdź tabelę webhooków

```sql
SELECT * FROM lemon_squeezy_webhooks
ORDER BY created_at DESC
LIMIT 10;
```

Sprawdź `payload` kolumnę, aby zobaczyć dokładnie co przyszło z Lemon Squeezy.

---

## Najczęstsze problemy

### Problem 1: Brak custom_data w webhook

**Przyczyna:** Checkout nie przekazuje `user_id`

**Rozwiązanie:** Sprawdź czy w `app/api/billing/create-checkout/route.ts` jest:

```typescript
const checkoutUrl = await generateCheckoutUrl(
    variantId,
    user.email,
    user.id, // ← To jest przekazywane jako custom_data.user_id
    user.name
);
```

### Problem 2: Błędne mapowanie variant_id

**Przyczyna:** Variant ID z Lemon Squeezy nie pasuje do zmiennych środowiskowych

**Rozwiązanie:**

1. Zaloguj się do Lemon Squeezy Dashboard
2. Znajdź swoje produkty
3. Skopiuj variant ID dla każdego planu
4. Wklej do `.env.local`:
    ```env
    NEXT_PUBLIC_LS_VARIANT_BASIC=prawdziwy-id
    NEXT_PUBLIC_LS_VARIANT_PRO=prawdziwy-id
    NEXT_PUBLIC_LS_VARIANT_UNLIMITED=prawdziwy-id
    ```
5. Zrestartuj dev server

### Problem 3: Webhooks przychodzą ale nic się nie dzieje

**Przyczyna:** Webhook secret jest nieprawidłowy

**Rozwiązanie:**

1. Lemon Squeezy Dashboard → Settings → Webhooks
2. Skopiuj signing secret
3. Wklej do `.env.local`:
    ```env
    LEMON_SQUEEZY_WEBHOOK_SECRET=prawdziwy-secret
    ```
4. Zrestartuj dev server

---

## Kolejność webhooków Lemon Squeezy

Typowa kolejność eventów:

1. `order_created` - Zamówienie utworzone
2. `subscription_payment_success` - Płatność pomyślna ← **TU AKTUALIZUJEMY PLAN**
3. `subscription_created` - Subskrypcja utworzona
4. `subscription_updated` - Subskrypcja zaktualizowana

**Ważne:** Plan jest teraz aktualizowany w `subscription_payment_success`, więc nawet jeśli ten event przychodzi pierwszy, powinno działać.

---

## Kontakt

Jeśli problem nadal występuje po sprawdzeniu wszystkich kroków powyżej:

1. Skopiuj logi z terminala
2. Skopiuj payload z tabeli `lemon_squeezy_webhooks`
3. Sprawdź czy zmienne środowiskowe są poprawnie ustawione
