# 📧 Gmail SMTP - Szybka Konfiguracja

## Krok 1: Włącz 2-Step Verification

1. Przejdź na: https://myaccount.google.com/security
2. W sekcji "Signing in to Google" kliknij **2-Step Verification**
3. Postępuj zgodnie z instrukcjami, aby włączyć weryfikację dwuetapową

## Krok 2: Wygeneruj App Password

1. Przejdź na: https://myaccount.google.com/apppasswords

    _(lub Google Account → Security → 2-Step Verification → App passwords)_

2. Kliknij **Select app** → wybierz "Mail"
3. Kliknij **Select device** → wybierz "Other (Custom name)"
4. Wpisz nazwę: `SaaS Newsletter`
5. Kliknij **Generate**
6. **Skopiuj 16-znakowe hasło** (np. `abcd efgh ijkl mnop`)

## Krok 3: Dodaj do .env

Dodaj do pliku `.env` lub `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=twoj-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=noreply@twoja-domena.com
```

**⚠️ Uwaga:**

-   Użyj hasła aplikacji (16 znaków), NIE swojego hasła Gmail
-   Usuń spacje z hasła (np. `abcd efgh` → `abcdefgh`)
-   `SMTP_USER` to Twój pełny adres Gmail
-   `SMTP_FROM` może być inny niż SMTP_USER

## Krok 4: Test Połączenia

Uruchom test:

```bash
npm run dev
```

Następnie wywołaj endpoint:

```bash
curl -X POST http://localhost:3000/api/newsletter/send
```

lub

```bash
curl -X POST http://localhost:3000/api/alerts/storage
```

## ⚠️ Troubleshooting

### Problem: "Invalid login" lub "Authentication failed"

**Rozwiązanie:**

1. Sprawdź czy 2-Step Verification jest włączona
2. Wygeneruj nowe App Password
3. Upewnij się, że skopiowałeś hasło BEZ spacji
4. Sprawdź czy `SMTP_USER` to pełny email (@gmail.com)

### Problem: "Connection timeout"

**Rozwiązanie:**

1. Sprawdź czy port 587 nie jest zablokowany przez firewall
2. Spróbuj alternatywnego portu:
    ```env
    SMTP_PORT=465
    SMTP_SECURE=true
    ```

### Problem: Email trafia do SPAM

**Rozwiązanie:**

1. Dodaj SPF record do domeny:
    ```
    v=spf1 include:_spf.google.com ~all
    ```
2. Użyj dedykowanego SMTP (SendGrid, Mailgun)
3. Ustaw `SMTP_FROM` jako zweryfikowany email w Gmail

### Problem: "Too many emails sent"

Gmail ma limity:

-   **500 emaili / dzień** (konto prywatne)
-   **2000 emaili / dzień** (Google Workspace)

**Rozwiązanie:**

-   Użyj SendGrid (100 emaili/dzień darmowo)
-   Użyj Mailgun (5000 emaili/miesiąc darmowo)
-   Użyj AWS SES (62,000 emaili/miesiąc darmowo)

---

## 🎯 Alternatywy dla Gmail

### SendGrid (Zalecane dla produkcji)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=twoj-sendgrid-api-key
SMTP_FROM=noreply@twoja-domena.com
```

**Zalety:**

-   100 emaili/dzień darmowo
-   Tracking opens/clicks
-   Dedicated IP (płatne)
-   Lepsza deliverability

**Setup:** https://sendgrid.com

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@twoja-domena.mailgun.org
SMTP_PASS=twoj-mailgun-smtp-password
SMTP_FROM=noreply@twoja-domena.com
```

**Zalety:**

-   5000 emaili/miesiąc darmowo (3 miesiące)
-   Dedicated domains
-   Analytics

**Setup:** https://mailgun.com

### AWS SES (Najlepsza skalowalność)

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=twoj-aws-smtp-username
SMTP_PASS=twoj-aws-smtp-password
SMTP_FROM=noreply@twoja-domena.com
```

**Zalety:**

-   62,000 emaili/miesiąc darmowo (przez EC2)
-   $0.10 za 1000 emaili (po limicie)
-   Nieskończona skalowalność

**Setup:** https://aws.amazon.com/ses/

---

## ✅ Weryfikacja Konfiguracji

Po skonfigurowaniu SMTP, sprawdź:

1. ✅ Czy email wysyła się lokalnie
2. ✅ Czy email dociera (sprawdź SPAM)
3. ✅ Czy linki w emailu działają
4. ✅ Czy unsubscribe działa
5. ✅ Czy template wygląda dobrze na mobile

---

## 🔒 Bezpieczeństwo

**NIE commituj** pliku `.env` do Git!

Dodaj do `.gitignore`:

```
.env
.env.local
.env*.local
```

Użyj zmiennych środowiskowych w Vercel/hosting:

1. Vercel: Settings → Environment Variables
2. Netlify: Site settings → Environment variables
3. Railway: Settings → Variables

---

**Gotowe! 🚀**

Jeśli masz problemy, sprawdź:

-   https://support.google.com/accounts/answer/185833 (App passwords)
-   https://support.google.com/a/answer/176600 (SMTP limits)
