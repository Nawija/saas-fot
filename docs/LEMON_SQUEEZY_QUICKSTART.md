# 🚀 Quick Start - Testowanie płatności Lemon Squeezy

## Krok 1: Uruchom migrację bazy danych

1. Przejdź do https://console.neon.tech
2. Wybierz swoją bazę danych `neondb`
3. Otwórz SQL Editor
4. Skopiuj zawartość pliku `database/migration_subscription.sql`
5. Wklej do SQL Editor i uruchom (Execute)
6. Sprawdź czy migracja się powiodła - powinny pojawić się nowe kolumny

## Krok 2: Skonfiguruj Lemon Squeezy

### W dashboardzie Lemon Squeezy (Test Mode):

1. **Utwórz 3 produkty subskrypcyjne:**

    - Basic Plan: $8/miesiąc
    - Pro Plan: $16/miesiąc
    - Unlimited Plan: $40/miesiąc

2. **Skopiuj Variant IDs** dla każdego planu

3. **Znajdź Store ID:**

    - Settings → General → Store ID

4. **Utwórz Webhook:**
    - Settings → Webhooks → Create Webhook
    - URL (dla ngrok): `https://twoj-ngrok.ngrok.io/api/webhooks/lemon-squeezy`
    - Zaznacz eventy: subscription_created, subscription_updated, subscription_cancelled, payment_success, payment_failed
    - Skopiuj Signing Secret

## Krok 3: Uzupełnij plik .env

```env
# Lemon Squeezy Configuration
LEMON_SQUEEZY_API_KEY=twój-api-key-z-dashboardu
LEMON_SQUEEZY_WEBHOOK_SECRET=whsec_xxx-skopiowany-signing-secret
NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID=twoj-store-id

# Variant IDs z Lemon Squeezy
NEXT_PUBLIC_LS_VARIANT_BASIC=123456
NEXT_PUBLIC_LS_VARIANT_PRO=123457
NEXT_PUBLIC_LS_VARIANT_UNLIMITED=123458
```

## Krok 4: Uruchom ngrok (dla testów lokalnych)

```powershell
# Terminal 1 - Aplikacja
npm run dev

# Terminal 2 - ngrok
ngrok http 3000
```

**WAŻNE:** Skopiuj URL z ngrok (np. `https://abc123.ngrok.io`) i zaktualizuj webhook URL w Lemon Squeezy!

## Krok 5: Testuj płatność! 🎉

1. Zaloguj się do aplikacji: http://localhost:3000
2. Kliknij avatar → **Subskrypcja i płatności**
3. Wybierz plan (np. Pro - $16/miesiąc)
4. Na stronie checkout użyj testowej karty:
    - Numer: `4242 4242 4242 4242`
    - Data: `12/25`
    - CVC: `123`
    - ZIP: `12345`
5. Zatwierdź płatność
6. Poczekaj na przekierowanie
7. Sprawdź w `/dashboard/billing` czy plan się zmienił!

## Co powinieneś zobaczyć:

### W aplikacji:

-   ✅ Plan zmieniony na "Pro"
-   ✅ Status: "Aktywna"
-   ✅ Storage limit: 100 GB
-   ✅ Pasek postępu storage
-   ✅ Link do zarządzania subskrypcją

### W terminalu (logi):

```
✅ Webhook received: subscription_created
✅ User 1 subscribed to pro plan
✅ Storage limit updated to 107374182400 bytes
```

### W Lemon Squeezy Dashboard:

-   ✅ Nowa subskrypcja w "Subscriptions"
-   ✅ Webhook delivery status: 200 OK

### W bazie danych (Neon):

```sql
SELECT
    email,
    subscription_plan,
    subscription_status,
    storage_limit,
    lemon_squeezy_customer_id
FROM users
WHERE id = 1;
```

Wynik:

```
email: twoj@email.com
subscription_plan: pro
subscription_status: active
storage_limit: 107374182400
lemon_squeezy_customer_id: 123456
```

## Troubleshooting

### Problem: "Nie można połączyć z webhook"

**Rozwiązanie:** Sprawdź czy ngrok działa i URL jest zaktualizowany w Lemon Squeezy

### Problem: "Signature verification failed"

**Rozwiązanie:** Sprawdź czy `LEMON_SQUEEZY_WEBHOOK_SECRET` w `.env` jest poprawny

### Problem: "Plan nie aktualizuje się"

**Rozwiązanie:**

1. Sprawdź logi w terminalu
2. Sprawdź webhook delivery w Lemon Squeezy
3. Sprawdź czy Variant IDs są poprawne

### Problem: "Cannot read property of undefined"

**Rozwiązanie:** Uruchom ponownie `npm run dev` po zmianie `.env`

## Następne kroki

Po udanym teście:

1. ✅ Anuluj testową subskrypcję w Lemon Squeezy
2. ✅ Przygotuj produkty w Production Mode
3. ✅ Zaktualizuj webhook URL na produkcyjny
4. ✅ Zaimplementuj upload zdjęć z tracking storage
5. ✅ Dodaj galerie i kolekcje

---

**Gotowe! Masz działający system płatności! 🎊**

Potrzebujesz pomocy? Sprawdź pełną dokumentację w `docs/LEMON_SQUEEZY_SETUP.md`
