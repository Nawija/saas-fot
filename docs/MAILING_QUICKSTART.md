# 🚀 Quick Start - Mailing System Setup

Ten przewodnik przeprowadzi Cię przez konfigurację systemów mailingowych w 5 minut.

## 📋 Krok 1: Instalacja Zależności

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## 🗄️ Krok 2: Migracja Bazy Danych

Wykonaj w swojej bazie PostgreSQL:

```bash
psql -d your_database -f database/migration_newsletter.sql
```

Lub ręcznie wykonaj SQL z pliku `database/migration_newsletter.sql`

## ⚙️ Krok 3: Konfiguracja Zmiennych Środowiskowych

Skopiuj `.env.mailing.example` do swojego `.env` i uzupełnij:

```env
# Gmail (Najprostsze)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=twoj-email@gmail.com
SMTP_PASS=twoje-haslo-aplikacji
SMTP_FROM=noreply@twojastrona.com

# URL aplikacji
NEXT_PUBLIC_APP_URL=https://twoja-domena.com

# Opcjonalnie - zabezpieczenie CRON
CRON_SECRET=wygeneruj-losowy-token
```

### 🔑 Jak uzyskać hasło aplikacji Gmail?

1. Przejdź na: https://myaccount.google.com/security
2. Włącz "2-Step Verification"
3. Przejdź do "App passwords"
4. Wygeneruj nowe hasło aplikacji
5. Użyj go jako `SMTP_PASS`

## 🏗️ Krok 4: Build i Deploy

```bash
npm run build
npm run start

# Lub deploy na Vercel:
vercel --prod
```

## 📝 Krok 5: Utworzenie Pierwszego Newslettera

1. Przejdź na: `https://twoja-domena.com/admin/newsletter`
2. Wypełnij tytuł i treść
3. Kliknij "Save Newsletter"
4. Przetestuj wysyłkę przyciskiem "Send Now"

## 🔔 Krok 6: Konfiguracja CRON Jobs

### A. Przejdź na https://console.cron-job.org i utwórz konto

### B. Dodaj Job dla Storage Alerts:

-   **Title**: Storage Alerts
-   **URL**: `https://twoja-domena.com/api/alerts/storage`
-   **Method**: POST
-   **Schedule**: `0 9 * * *` (codziennie o 9:00)
-   **Headers** (opcjonalnie):
    ```
    Authorization: Bearer twoj-cron-secret
    ```

### C. Dodaj Job dla Newsletter:

-   **Title**: Newsletter Daily
-   **URL**: `https://twoja-domena.com/api/newsletter/send`
-   **Method**: POST
-   **Schedule**: `0 10 * * *` (codziennie o 10:00)
-   **Headers** (opcjonalnie):
    ```
    Authorization: Bearer twoj-cron-secret
    ```

## ✅ Krok 7: Testowanie

### Test Subskrypcji:

1. Przejdź na `/newsletter`
2. Wpisz swój email
3. Kliknij "Subscribe"

### Test Wysyłki Newslettera:

1. Przejdź na `/admin/newsletter`
2. Kliknij "Send Now"
3. Sprawdź skrzynkę email

### Test Storage Alerts:

```bash
# Wywołaj endpoint ręcznie:
curl -X POST https://twoja-domena.com/api/alerts/storage
```

## 📍 Ważne Endpointy

| Endpoint                    | Cel                        |
| --------------------------- | -------------------------- |
| `/newsletter`               | Formularz subskrypcji      |
| `/admin/newsletter`         | Panel admina               |
| `/api/newsletter/subscribe` | API subskrypcji            |
| `/api/newsletter/send`      | Wysyłka newslettera (CRON) |
| `/api/alerts/storage`       | Storage alerts (CRON)      |

## 🎨 Customizacja Emaili

Edytuj szablony w:

-   `lib/templates/newsletter.html` - Newsletter
-   `lib/templates/storageAlert.html` - Storage alert

Zmienne dostępne w szablonach:

-   Newsletter: `{{title}}`, `{{content}}`, `{{websiteUrl}}`, `{{unsubscribeUrl}}`
-   Storage: `{{storagePercent}}`, `{{storageUsed}}`, `{{storageLimit}}`, `{{dashboardUrl}}`

## 🔧 Troubleshooting

### Email nie wysyła się?

-   Sprawdź logi w konsoli
-   Zweryfikuj dane SMTP
-   Sprawdź czy port 587 jest otwarty

### Newsletter nie dociera?

-   Sprawdź folder SPAM
-   Dodaj SPF/DKIM do domeny
-   Użyj dedykowanego SMTP (SendGrid, Mailgun)

### CRON nie odpala?

-   Sprawdź execution history w console.cron-job.org
-   Zweryfikuj URL (https://)
-   Sprawdź authorization header

## 📚 Pełna Dokumentacja

Zobacz `docs/MAILING_SYSTEM.md` dla szczegółowej dokumentacji.

## 🎉 Gotowe!

Twój system mailingowy jest teraz skonfigurowany i gotowy do użycia!

**Co dalej?**

-   Dodaj swój pierwszy newsletter w panelu admina
-   Udostępnij link `/newsletter` na swojej stronie
-   Monitoruj statystyki w panelu admina
-   Sprawdzaj logi CRON w console.cron-job.org
