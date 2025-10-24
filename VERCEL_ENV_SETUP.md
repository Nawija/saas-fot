# Konfiguracja zmiennych środowiskowych na Vercel

## ⚠️ PILNA POPRAWKA W LOKALNYM .env

W pliku `.env` masz błędną nazwę zmiennej:
```
LEMON_SQUEEZY_WEBHOOK_SECRET=saasaas  ❌ BŁĄD - literówka
```

Zmień na:
```
LEMON_SQUEEZY_WEBHOOK_SECRET=saasaas  ✅ POPRAWNE
```

## 📝 Webhook URL w Lemon Squeezy

Zaktualizuj w Lemon Squeezy Dashboard → Webhooks → Callback URL:

**Dla testów lokalnych (ngrok):**
```
https://quaternate-ungestural-kristal.ngrok-free.dev/api/webhooks/lemon-squeezy
```

**Dla produkcji (Vercel):**
```
https://saas-fot.vercel.app/api/webhooks/lemon-squeezy
```

## 🔐 Zmienne do dodania na Vercel

### Krok 1: Przejdź do Vercel Dashboard
1. Otwórz https://vercel.com/dashboard
2. Wybierz projekt `saas-fot`
3. Idź do **Settings** → **Environment Variables**

### Krok 2: Dodaj następujące zmienne

#### Server-side (Secret) - NIE używaj jako Public

```
LEMON_SQUEEZY_API_KEY
```
Wartość:
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiI5MGVlZjM2NDhlZGY0NWI3Njc1MmY2MGNmMzY1MGVmM2MxNmQ1MDg5MTdjMDM1ZjU0ZTUzZjYwOTA2MjJmNTI2MDU2OGVhZDFiZTY1NmY3MCIsImlhdCI6MTc2MTMzOTY2MC42OTQ3NDcsIm5iZiI6MTc2MTMzOTY2MC42OTQ3NDksImV4cCI6MjA3Njg3MjQ2MC42Nzg2OTEsInN1YiI6IjU4MjUwMzAiLCJzY29wZXMiOltdfQ.QbrLDXqZho_7CCJMGiIn1lvTVEDye8CPsAg7eLTnGezzlvC9njXiCOB3qry11lBGQYzv4EzjAEYhzrseuUsluA3Y618KHSMn7RO5HPYM9_F2kqwJSGx1m0Nafi-7hgdov-Uz9K39NwKOa-QwLsDAHeId_yFvWL1cS8f5RaMGnUHCc7FXexi0yT1YzTyWoSc4BWYC_j3nJ6YktXpL1R4W7MRuBu55LCpxtREkJHnL994LX_X0hO_47JFGZjVKk3Mz4qOfYdz8r46vMjZYRS2YBWCS9v_KyZ7zoDgEmuLEJLKcz-dyoY4GiDb8D3MNwWBmKveerHf3zFURsEx0ng_AImtsdqSE_AVgdlAkOPOjydBXVAgt8-24RTqIIuc90Fb_VMrT8-3PUwvdVlKoX97byGL5k_08vZRqFS2BVtLGbKuOnHUzbI8h-B8IyO5x2veztEl1XeiegGXiLluQUSrHkivZafVmtozkB3-NtcbsgfdXIrPZs5RNkWy_762f67hnz8wEodhcdXP355aSuorWYgpvUXstOvrEvfCTwvG_TbiLMIMkv58v-QoX3-NG0fuD3Z3ukxw_Np29iKmUnWVWoozaOqygpwYg9qSeI2E7-I7ORiN4i0VtHUyRx0KobS8AE5PK1M0IqsejfBV7RRhmmXV0W8QaCZFpQBFpocbEZgA
```

---

```
LEMON_SQUEEZY_WEBHOOK_SECRET
```
Wartość:
```
saasaas
```

---

#### Client-side (Public) - zaznacz jako "Expose"

```
NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID
```
Wartość:
```
235124
```

---

```
NEXT_PUBLIC_LS_VARIANT_BASIC
```
Wartość:
```
1056561
```

---

```
NEXT_PUBLIC_LS_VARIANT_PRO
```
Wartość: (uzupełnij Variant ID dla planu Pro)
```
222222
```

---

```
NEXT_PUBLIC_LS_VARIANT_UNLIMITED
```
Wartość: (uzupełnij Variant ID dla planu Unlimited)
```
333333
```

---

#### Inne zmienne (jeśli jeszcze nie dodane)

```
NEXT_PUBLIC_APP_URL
```
Wartość:
```
https://saas-fot.vercel.app
```

---

```
NEXT_PUBLIC_R2_PUBLIC_DOMAIN
```
Wartość:
```
https://pub-53d7668c089b405c91c4867c026d81b0.r2.dev
```

### Krok 3: Environment Scope
Dla każdej zmiennej wybierz:
- ✅ Production
- ✅ Preview (opcjonalnie)
- ⬜ Development (zostaw puste - używasz lokalnego .env)

### Krok 4: Redeploy
Po dodaniu wszystkich zmiennych:
1. Idź do **Deployments**
2. Kliknij **⋯** (trzy kropki) przy ostatnim deployment
3. Wybierz **Redeploy**
4. Poczekaj na zakończenie buildu

## ✅ Checklist testowania

Po redeployu sprawdź:

1. **Webhook działa:**
   - Wykonaj testową płatność w Test Mode
   - Sprawdź Lemon Squeezy → Webhooks → Recent deliveries
   - Status powinien być 200 OK

2. **Plan się aktualizuje:**
   ```sql
   SELECT id, email, subscription_plan, subscription_status, storage_limit 
   FROM users 
   WHERE id = 'twoje-user-id';
   ```
   - `subscription_plan` powinno być `basic`/`pro`/`unlimited`
   - `storage_limit` powinno być odpowiednio 10GB/100GB/unlimited

3. **Checkout działa:**
   - Przejdź do `/dashboard/billing`
   - Kliknij "Wybierz plan"
   - Sprawdź czy przekierowuje do Lemon Squeezy

## 🐛 Debugowanie

### Problem: Invalid signature
- Sprawdź czy `LEMON_SQUEEZY_WEBHOOK_SECRET` na Vercel jest identyczny z tym w Lemon Squeezy
- Upewnij się że nie ma spacji/nowych linii w wartości

### Problem: Plan się nie aktualizuje
- Sprawdź logi Vercel Functions (Real-time Logs)
- Sprawdź czy `NEXT_PUBLIC_LS_VARIANT_*` są poprawne
- Sprawdź czy w webhook payload jest `custom_data.user_id`

### Problem: Redirect do checkout nie działa
- Sprawdź czy wszystkie `NEXT_PUBLIC_*` są dostępne po stronie klienta
- W browser console sprawdź `console.log(process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID)`

## 📌 Notatki

- Test Mode w Lemon Squeezy ma osobny webhook i signing secret!
- Pamiętaj o oddzielnej konfiguracji dla Production Mode
- `NEXT_PUBLIC_*` zmienne wymagają rebuildu aplikacji
- Webhook URL musi zawierać pełną ścieżkę: `/api/webhooks/lemon-squeezy`
