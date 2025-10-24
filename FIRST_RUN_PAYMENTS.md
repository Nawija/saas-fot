# 🎯 PIERWSZE URUCHOMIENIE - TESTOWE PŁATNOŚCI

## ⚡ Szybki start (5 minut)

### 1️⃣ Uruchom migrację bazy danych

```powershell
# Otwórz https://console.neon.tech
# SQL Editor → Skopiuj i uruchom: database/migration_subscription.sql
```

### 2️⃣ Skonfiguruj Lemon Squeezy (Test Mode)

**Produkty do utworzenia:**

-   Basic: $8/miesiąc → Skopiuj Variant ID
-   Pro: $16/miesiąc → Skopiuj Variant ID
-   Unlimited: $40/miesiąc → Skopiuj Variant ID

**Store ID:** Settings → General → Skopiuj Store ID

**Webhook:**

-   URL: `https://twoj-ngrok.ngrok.io/api/webhooks/lemon-squeezy`
-   Eventy: subscription_created, subscription_updated, subscription_cancelled, payment_success, payment_failed
-   Skopiuj Signing Secret

### 3️⃣ Uzupełnij .env

```env
LEMON_SQUEEZY_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID=twoj-store-id
NEXT_PUBLIC_LS_VARIANT_BASIC=variant-id-1
NEXT_PUBLIC_LS_VARIANT_PRO=variant-id-2
NEXT_PUBLIC_LS_VARIANT_UNLIMITED=variant-id-3
```

### 4️⃣ Uruchom aplikację + ngrok

```powershell
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3000
# Skopiuj URL i zaktualizuj webhook w Lemon Squeezy!
```

### 5️⃣ Testuj!

1. Zaloguj się: http://localhost:3000
2. Avatar → Subskrypcja i płatności
3. Wybierz plan
4. Karta testowa: `4242 4242 4242 4242`, 12/25, 123
5. ✅ Sprawdź czy plan się zmienił!

---

## 📚 Szczegółowa dokumentacja

-   **Quick Start:** `docs/LEMON_SQUEEZY_QUICKSTART.md`
-   **Pełna konfiguracja:** `docs/LEMON_SQUEEZY_SETUP.md`
-   **Migracja SQL:** `database/migration_subscription.sql`

## 🐛 Najczęstsze problemy

**Webhook nie działa?**

-   Sprawdź czy ngrok działa
-   Zaktualizuj URL w Lemon Squeezy

**Plan nie aktualizuje się?**

-   Sprawdź logi w terminalu
-   Sprawdź czy Variant IDs są poprawne
-   Uruchom `npm run dev` ponownie po zmianie .env

**Błąd sygnatury?**

-   Sprawdź `LEMON_SQUEEZY_WEBHOOK_SECRET` w .env

---

**Gotowe! Teraz możesz testować płatności! 🚀**
