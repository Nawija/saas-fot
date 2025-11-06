# 📧 Mailing System - CRON Configuration Guide

## Przegląd Systemu

Aplikacja zawiera dwa niezależne systemy mailingowe:

1. **Storage Alerts** - Automatyczne powiadomienia o zapełnionym storage (≥70%)
2. **Newsletter** - Codzienny newsletter dla subskrybentów

Oba systemy działają w pełni automatycznie poprzez CRON jobs.

---

## 🔧 Wymagania Wstępne

### 1. Zmienne Środowiskowe

Dodaj do pliku `.env` lub `.env.local`:

```env
# SMTP Configuration (wymagane dla obu systemów)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourwebsite.com

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# CRON Security (opcjonalne, ale zalecane)
CRON_SECRET=your-secret-token-here
```

### 2. Migracja Bazy Danych

Wykonaj migrację SQL:

```bash
psql -d your_database -f database/migration_newsletter.sql
```

Lub ręcznie w Neon/PostgreSQL:

```sql
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  unsubscribe_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
);

CREATE TABLE IF NOT EXISTS newsletter_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## 🚀 Konfiguracja CRON Jobs

Przejdź na: **https://console.cron-job.org**

### Rejestracja i Setup

1. Utwórz konto na console.cron-job.org (darmowe)
2. Przejdź do "Cronjobs" → "Create cronjob"

---

## 📋 SYSTEM 1: Storage Alerts

### Konfiguracja CRON Job

| Parametr           | Wartość                                      |
| ------------------ | -------------------------------------------- |
| **Title**          | Storage Alerts - Daily Check                 |
| **URL**            | `https://your-domain.com/api/alerts/storage` |
| **Request Method** | POST                                         |
| **Schedule**       | `0 9 * * *` (codziennie o 9:00)              |
| **Enabled**        | ✓                                            |

### Opcjonalne Headers (jeśli używasz CRON_SECRET):

```
Authorization: Bearer your-secret-token-here
Content-Type: application/json
```

### Schedule Variations:

-   **Co dzień o 9:00**: `0 9 * * *`
-   **Co dzień o 8:00 i 18:00**: `0 8,18 * * *`
-   **Tylko dni robocze o 9:00**: `0 9 * * 1-5`

### Jak to działa:

1. CRON odpala endpoint `/api/alerts/storage`
2. Endpoint sprawdza użytkowników z `storage_used / storage_limit >= 0.7`
3. Wysyła email z szablonu `lib/templates/storageAlert.html`
4. Każdy użytkownik dostaje spersonalizowany mail z:
    - Procentem zajętości storage
    - Ilością zajętego miejsca (w GB/MB)
    - Linkiem do dashboardu

---

## 📰 SYSTEM 2: Newsletter

### Konfiguracja CRON Job

| Parametr           | Wartość                                       |
| ------------------ | --------------------------------------------- |
| **Title**          | Newsletter - Daily Send                       |
| **URL**            | `https://your-domain.com/api/newsletter/send` |
| **Request Method** | POST                                          |
| **Schedule**       | `0 10 * * *` (codziennie o 10:00)             |
| **Enabled**        | ✓                                             |

### Opcjonalne Headers (jeśli używasz CRON_SECRET):

```
Authorization: Bearer your-secret-token-here
Content-Type: application/json
```

### Schedule Variations:

-   **Co dzień o 10:00**: `0 10 * * *`
-   **Co dzień o 7:00**: `0 7 * * *`
-   **Tylko poniedziałek o 9:00**: `0 9 * * 1`

### Jak to działa:

1. CRON odpala endpoint `/api/newsletter/send`
2. Endpoint pobiera ostatni newsletter z tabeli `newsletter_messages`
3. Pobiera wszystkich aktywnych subskrybentów (`is_active = true`)
4. Wysyła newsletter do każdego subskrybenta z:
    - Treścią z panelu admina
    - Unikalnym linkiem do wypisania się
5. Zwraca statystyki (ile wysłano, ile błędów)

---

## 🎨 Zarządzanie Contentem

### Panel Admina

Dostęp: `https://your-domain.com/admin/newsletter`

**Funkcje:**

-   ✍️ Edycja tytułu i treści newslettera
-   👀 Podgląd aktualnego newslettera
-   📊 Statystyki subskrybentów (total, active, unsubscribed)
-   📧 Lista wszystkich subskrybentów
-   ⚡ Manualne wysłanie newslettera (przycisk "Send Now")

### Strona Subskrypcji

Dostęp: `https://your-domain.com/newsletter`

**Funkcje:**

-   📝 Formularz zapisu na newsletter
-   ✅ Walidacja email
-   📬 Potwierdzenie subskrypcji
-   ❌ Obsługa błędów (duplikaty, nieprawidłowy format)

---

## 🔒 Zabezpieczenia

### 1. CRON Authorization (Zalecane)

Dodaj w `.env`:

```env
CRON_SECRET=wygeneruj-mocny-token-tutaj
```

W CRON jobs dodaj header:

```
Authorization: Bearer wygeneruj-mocny-token-tutaj
```

### 2. Rate Limiting

Rozważ dodanie rate limiting dla endpointów:

-   `/api/newsletter/subscribe`
-   `/api/newsletter/send`
-   `/api/alerts/storage`

### 3. Email Validation

Wszystkie endpointy zawierają:

-   Walidację formatu email
-   Sprawdzanie duplikatów
-   Sanityzację inputów

---

## 📧 Szablony Email

### Storage Alert Template

Lokalizacja: `lib/templates/storageAlert.html`

**Zmienne:**

-   `{{storagePercent}}` - Procent zajętości (np. "72.5")
-   `{{storageUsed}}` - Zajęte miejsce (np. "1.5 GB")
-   `{{storageLimit}}` - Limit (np. "2 GB")
-   `{{dashboardUrl}}` - Link do dashboardu

### Newsletter Template

Lokalizacja: `lib/templates/newsletter.html`

**Zmienne:**

-   `{{title}}` - Tytuł newslettera
-   `{{content}}` - Treść (HTML)
-   `{{websiteUrl}}` - Link do strony głównej
-   `{{unsubscribeUrl}}` - Link do wypisania się

---

## 🧪 Testowanie

### 1. Test Lokalny - Storage Alerts

```bash
# PowerShell
curl -X POST http://localhost:3000/api/alerts/storage `
  -H "Content-Type: application/json"

# Lub w przeglądarce (Postman/Insomnia)
POST http://localhost:3000/api/alerts/storage
```

### 2. Test Lokalny - Newsletter

```bash
# PowerShell
curl -X POST http://localhost:3000/api/newsletter/send `
  -H "Content-Type: application/json"
```

### 3. Test Produkcyjny

Po wdrożeniu możesz testować poprzez:

-   Kliknięcie "Send Now" w panelu admina
-   Wywołanie URL z CRON manually
-   Użycie "Run now" w console.cron-job.org

---

## 📊 Monitoring

### Logi w CRON Job

W console.cron-job.org:

1. Kliknij na job
2. Zobacz "Execution history"
3. Sprawdź status codes:
    - `200` - Sukces
    - `401` - Błąd autoryzacji
    - `404` - Nie znaleziono newslettera
    - `500` - Błąd serwera

### Response Examples

**Storage Alerts - Success:**

```json
{
    "message": "Storage alerts sending completed",
    "sent": 5,
    "failed": 0,
    "total": 5
}
```

**Newsletter - Success:**

```json
{
    "message": "Newsletter sending completed",
    "sent": 150,
    "failed": 2,
    "total": 152,
    "newsletterTitle": "Weekly Update #42"
}
```

**No Subscribers:**

```json
{
    "message": "No active subscribers found.",
    "sent": 0
}
```

---

## ⚡ Instalacja Zależności

Jeśli nie masz nodemailer:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

## 🎯 Quick Start Checklist

-   [ ] Dodaj zmienne SMTP do `.env`
-   [ ] Wykonaj migrację SQL (newsletter tables)
-   [ ] Zainstaluj `nodemailer`
-   [ ] Zbuduj i wdróż aplikację
-   [ ] Utwórz konto na console.cron-job.org
-   [ ] Dodaj CRON job dla storage alerts
-   [ ] Dodaj CRON job dla newsletter
-   [ ] Przetestuj oba endpointy
-   [ ] Dodaj newsletter w panelu admina `/admin/newsletter`
-   [ ] Przetestuj subskrypcję na `/newsletter`

---

## 🔗 Endpointy API

| Endpoint                            | Method       | Opis                     |
| ----------------------------------- | ------------ | ------------------------ |
| `/api/alerts/storage`               | POST         | Wysyła alerty storage    |
| `/api/newsletter/send`              | POST         | Wysyła newsletter        |
| `/api/newsletter/subscribe`         | POST         | Dodaje subskrybenta      |
| `/api/admin/newsletter`             | GET/POST/PUT | Zarządzanie newsletterem |
| `/api/admin/newsletter/subscribers` | GET          | Lista subskrybentów      |
| `/newsletter/unsubscribe`           | GET          | Wypisanie się            |

---

## 💡 Przykładowy CRON Expression

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 7) (0 = Sunday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

**Przykłady:**

-   `0 9 * * *` - Co dzień o 9:00
-   `0 */6 * * *` - Co 6 godzin
-   `0 9 * * 1` - Każdy poniedziałek o 9:00
-   `30 8 1 * *` - 1-szego dnia miesiąca o 8:30

---

## 🛠️ Troubleshooting

### Problem: "Unauthorized 401"

**Rozwiązanie:** Sprawdź czy CRON_SECRET w .env jest taki sam jak w header Authorization

### Problem: "No newsletter found 404"

**Rozwiązanie:** Utwórz newsletter w panelu admina `/admin/newsletter`

### Problem: "Failed to send email"

**Rozwiązanie:** Sprawdź:

-   Poprawność danych SMTP
-   Czy email nie jest blokowany przez spam filter
-   Czy SMTP_USER ma uprawnienia do wysyłki

### Problem: Email trafia do SPAM

**Rozwiązanie:**

-   Dodaj SPF/DKIM records dla domeny
-   Użyj dedykowanego SMTP (SendGrid, Mailgun, AWS SES)
-   Dodaj unsubscribe link (już jest w szablonie)

---

## 📞 Support

Jeśli masz problemy:

1. Sprawdź logi w konsoli Next.js
2. Sprawdź execution history w console.cron-job.org
3. Przetestuj endpointy lokalnie
4. Sprawdź zmienne środowiskowe

---

**Powodzenia! 🚀**
