# Konfiguracja Lemon Squeezy - Instrukcja

## 1. Konfiguracja produktów w Lemon Squeezy

### Zaloguj się do dashboardu Lemon Squeezy

1. Przejdź do https://app.lemonsqueezy.com
2. Zaloguj się na swoje konto

### Utwórz produkty z subskrypcją

#### Basic Plan - 10GB za $8/miesiąc

1. Idź do **Products** → **New Product**
2. Nazwa: `Basic Plan`
3. Cena: `$8.00`
4. Typ: **Subscription**
5. Billing: **Monthly**
6. Zapisz produkt
7. Skopiuj **Variant ID** (znajdziesz go w URL lub w szczegółach produktu)
8. Wklej do `.env` jako `NEXT_PUBLIC_LS_VARIANT_BASIC`

#### Pro Plan - 100GB za $16/miesiąc

1. Utwórz nowy produkt
2. Nazwa: `Pro Plan`
3. Cena: `$16.00`
4. Typ: **Subscription**
5. Billing: **Monthly**
6. Zapisz produkt
7. Skopiuj **Variant ID**
8. Wklej do `.env` jako `NEXT_PUBLIC_LS_VARIANT_PRO`

#### Unlimited Plan - Bez limitu za $40/miesiąc

1. Utwórz nowy produkt
2. Nazwa: `Unlimited Plan`
3. Cena: `$40.00`
4. Typ: **Subscription**
5. Billing: **Monthly**
6. Zapisz produkt
7. Skopiuj **Variant ID**
8. Wklej do `.env` jako `NEXT_PUBLIC_LS_VARIANT_UNLIMITED`

## 2. Znajdź Store ID

1. W dashboardzie Lemon Squeezy idź do **Settings** → **General**
2. Skopiuj **Store ID**
3. Wklej do `.env` jako `NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID`

## 3. Skonfiguruj Webhook

### Utwórz Webhook

1. Idź do **Settings** → **Webhooks**
2. Kliknij **Create Webhook**
3. URL: `https://twoja-domena.com/api/webhooks/lemon-squeezy`
    - Dla lokalu: `http://localhost:3000/api/webhooks/lemon-squeezy`
    - **UWAGA**: Webhooks w trybie lokalnym wymagają tunelu (np. ngrok)
4. Signing Secret: zostanie wygenerowany automatycznie
5. Skopiuj **Signing Secret**
6. Wklej do `.env` jako `LEMON_SQUEEZY_WEBHOOK_SECRET`

### Wybierz eventy do śledzenia

Zaznacz następujące eventy:

-   ✅ `subscription_created`
-   ✅ `subscription_updated`
-   ✅ `subscription_cancelled`
-   ✅ `subscription_expired`
-   ✅ `subscription_payment_success`
-   ✅ `subscription_payment_failed`

Zapisz webhook.

## 4. Konfiguracja testowego środowiska (Test Mode)

### Włącz Test Mode

1. W dashboardzie Lemon Squeezy przełącz się na **Test Mode** (przełącznik w górnym pasku)
2. Wszystkie produkty i webhooks muszą być skonfigurowane osobno w Test Mode!

### Testowe karty kredytowe

W Test Mode możesz używać następujących numerów kart:

#### Udana płatność

-   Numer: `4242 4242 4242 4242`
-   Data: dowolna przyszła data (np. `12/25`)
-   CVC: dowolne 3 cyfry (np. `123`)
-   ZIP: dowolny (np. `12345`)

#### Płatność odrzucona

-   Numer: `4000 0000 0000 0002`
-   Data: dowolna przyszła data
-   CVC: dowolne 3 cyfry
-   ZIP: dowolny

## 5. Testowanie lokalnie z ngrok

### Zainstaluj ngrok

```bash
# Windows (Chocolatey)
choco install ngrok

# Lub pobierz z https://ngrok.com/download
```

### Uruchom tunel

```bash
# W jednym terminalu uruchom aplikację
npm run dev

# W drugim terminalu uruchom ngrok
ngrok http 3000
```

### Zaktualizuj webhook URL

1. Skopiuj URL z ngrok (np. `https://abc123.ngrok.io`)
2. W Lemon Squeezy zaktualizuj webhook URL na:
   `https://abc123.ngrok.io/api/webhooks/lemon-squeezy`

## 6. Uruchomienie migracji bazy danych

Przed testowaniem płatności, uruchom SQL z pliku `database/schema.sql`:

```sql
-- Dodaj kolumny subskrypcji do tabeli users
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_limit BIGINT DEFAULT 2147483648;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id VARCHAR(255);

-- Utwórz tabelę dla webhooków
CREATE TABLE IF NOT EXISTS lemon_squeezy_webhooks (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 7. Przykładowy plik .env (kompletny)

```env
# Lemon Squeezy Configuration
LEMON_SQUEEZY_API_KEY=twoj-api-key
LEMON_SQUEEZY_WEBHOOK_SECRET=whsec_abc123xyz
NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID=12345

# Variant IDs
NEXT_PUBLIC_LS_VARIANT_BASIC=123456
NEXT_PUBLIC_LS_VARIANT_PRO=123457
NEXT_PUBLIC_LS_VARIANT_UNLIMITED=123458
```

## 8. Flow testowania

### Krok po kroku:

1. ✅ Zaloguj się do aplikacji
2. ✅ Przejdź do `/dashboard/billing`
3. ✅ Wybierz plan (np. Pro - $16/miesiąc)
4. ✅ Zostaniesz przekierowany do Lemon Squeezy checkout
5. ✅ Użyj testowej karty: `4242 4242 4242 4242`
6. ✅ Zatwierdź płatność
7. ✅ Webhook zostanie wysłany do aplikacji
8. ✅ Sprawdź w bazie danych czy:
    - `subscription_plan` = 'pro'
    - `subscription_status` = 'active'
    - `storage_limit` = 107374182400 (100GB w bajtach)
9. ✅ Odśwież `/dashboard/billing` - powinieneś zobaczyć aktywną subskrypcję

## 9. Debugging

### Sprawdź logi webhooków

1. W Lemon Squeezy: **Settings** → **Webhooks** → Kliknij na webhook
2. Sprawdź **Recent deliveries** - zobaczysz status każdego webhooka

### Sprawdź logi aplikacji

```bash
# W terminalu gdzie działa aplikacja zobaczysz:
# ✅ "Webhook received: subscription_created"
# ✅ "User 123 subscribed to pro plan"
```

### Najczęstsze problemy:

**Problem**: Webhook nie dociera do aplikacji

-   **Rozwiązanie**: Upewnij się że ngrok działa i URL jest zaktualizowany

**Problem**: Błąd weryfikacji sygnatury

-   **Rozwiązanie**: Sprawdź czy `LEMON_SQUEEZY_WEBHOOK_SECRET` jest poprawny

**Problem**: Plan nie aktualizuje się

-   **Rozwiązanie**: Sprawdź czy Variant IDs w `.env` są poprawne

**Problem**: Storage limit nie zmienia się

-   **Rozwiązanie**: Sprawdź czy migracja bazy danych została wykonana

## 10. Przejście na produkcję

Gdy wszystko działa w Test Mode:

1. Wyłącz Test Mode w Lemon Squeezy
2. Skonfiguruj produkty w Production Mode
3. Utwórz webhook w Production Mode z produkcyjnym URL
4. Zaktualizuj `.env` z produkcyjnymi Variant IDs
5. Zweryfikuj działanie z prawdziwą kartą (małą kwotą)

---

**Gotowe!** Teraz masz w pełni funkcjonalny system subskrypcji z Lemon Squeezy! 🎉
