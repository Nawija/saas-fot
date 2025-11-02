# Support System Documentation

## Overview

System supportu pozwala użytkownikom na:

-   **Kontakt** - wysyła email na seovileo@gmail.com przez nodemailer (Gmail SMTP)
-   **Zgłaszanie błędów** - zapisuje do bazy danych (tabela support_tickets)

## Struktura

### Strona Support

**URL:** `/support`

Zawiera:

-   Przełącznik między formularzem kontaktowym a zgłoszeniem błędu
-   Walidację danych po stronie klienta
-   Responsywny design
-   Feedback dla użytkownika (success/error)

### API Endpoints

#### 1. Contact Form - `/api/support/contact`

**Method:** POST

**Działanie:** Wysyła email na **seovileo@gmail.com** przez nodemailer (NIE zapisuje do bazy)

**Body:**

```json
{
    "email": "user@example.com",
    "subject": "Problem z galerią",
    "message": "Szczegółowy opis problemu..."
}
```

**Response:**

```json
{
    "ok": true,
    "message": "Wiadomość została wysłana"
}
```

**Email Configuration:**

-   Service: Gmail SMTP
-   From: `process.env.SMTP_USER` (infokwbot@gmail.com)
-   To: seovileo@gmail.com
-   Reply-To: email użytkownika (możesz odpowiedzieć bezpośrednio)

#### 2. Bug Report - `/api/support/bug`

**Method:** POST

**Działanie:** Zapisuje do bazy danych `support_tickets` (NIE wysyła email)

**Body:**

```json
{
    "email": "user@example.com",
    "title": "Błąd podczas uploadu zdjęć",
    "steps": "1. Kliknij upload\n2. Wybierz zdjęcia\n3. Zobacz błąd",
    "expected": "Zdjęcia powinny się załadować",
    "actual": "Pojawia się komunikat błędu"
}
```

**Response:**

```json
{
    "ok": true,
    "message": "Zgłoszenie błędu zostało wysłane"
}
```

## Baza danych

### Tabela: support_tickets

**Uwaga:** Tylko **bug reports** są zapisywane do bazy! Contact form wysyła email.

**Migracja:** `database/migration_support.sql`

**Struktura:**

```sql
- id: SERIAL PRIMARY KEY
- email: VARCHAR(255) - email użytkownika
- type: VARCHAR(20) - tylko 'bug' (contact nie jest zapisywane)

-- Pola dla bug report:
- title: TEXT
- steps: TEXT - kroki do odtworzenia
- expected: TEXT - oczekiwane zachowanie
- actual: TEXT - faktyczne zachowanie

-- Metadata:
- user_agent: TEXT
- referer: TEXT
- ip_address: VARCHAR(45)

-- Status tracking:
- status: VARCHAR(20) - 'open', 'in_progress', 'resolved', 'closed'
- assigned_to: UUID - FK do users
- resolved_at: TIMESTAMP

-- Timestamps:
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Uruchomienie migracji

```bash
# Połącz się z bazą i uruchom:
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f database/migration_support.sql
```

Lub przez Neon Console:

1. Wejdź do Neon Console
2. SQL Editor
3. Wklej zawartość `migration_support.sql`
4. Execute

## Przeglądanie zgłoszeń

### Przez PostgreSQL:

```sql
-- Wszystkie otwarte zgłoszenia
SELECT id, type, email, subject, title, created_at
FROM support_tickets
WHERE status = 'open'
ORDER BY created_at DESC;

-- Szczegóły konkretnego zgłoszenia
SELECT * FROM support_tickets WHERE id = 123;

-- Zgłoszenia typu bug
SELECT id, email, title, created_at
FROM support_tickets
WHERE type = 'bug' AND status = 'open'
ORDER BY created_at DESC;

-- Zgłoszenia kontaktowe
SELECT id, email, subject, created_at
FROM support_tickets
WHERE type = 'contact' AND status = 'open'
ORDER BY created_at DESC;

-- Zaktualizuj status
UPDATE support_tickets
SET status = 'resolved', resolved_at = NOW()
WHERE id = 123;
```

### Przez Neon SQL Editor:

1. Zaloguj się do Neon Console
2. Wybierz SQL Editor
3. Uruchom query:

```sql
SELECT
    id,
    type,
    email,
    COALESCE(subject, title) as topic,
    status,
    created_at
FROM support_tickets
ORDER BY created_at DESC
LIMIT 50;
```

## Integracje (TODO)

### Email Notifications

Możesz dodać integrację z:

-   **Resend** - nowoczesny email API
-   **SendGrid** - popularne rozwiązanie
-   **Amazon SES** - tanie dla dużych wolumenów

Dodaj w API endpoints:

```typescript
// W /api/support/contact/route.ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
    from: "support@seovileo.pl",
    to: "admin@seovileo.pl",
    subject: `New Support Ticket: ${subject}`,
    html: `<p>From: ${email}</p><p>${message}</p>`,
});
```

### Bug Tracking Systems

Możesz zintegrować z:

-   **Linear** - modern issue tracking
-   **Jira** - enterprise solution
-   **GitHub Issues** - jeśli używasz GitHub

## UI Components

### Linki do strony Support:

1. **Sidebar** (dla zalogowanych) - dodany w `DashboardSidebar.tsx`
2. **Footer** (dla wszystkich) - dodany w głównym `layout.tsx`

### Dostęp:

-   **Zalogowani użytkownicy:** Sidebar → Support
-   **Niezalogowani:** Footer → Support
-   **Direct URL:** `/support`

## Customizacja

### Zmiana emaila supportu:

W `app/support/page.tsx` linia ~360:

```tsx
<a href="mailto:support@seovileo.pl">
```

### Zmiana czasu odpowiedzi:

W `app/support/page.tsx` linia ~358:

```tsx
<p>Odpowiadamy zwykle w ciągu 24 godzin</p>
```

### Zmiana stylów:

Możesz edytować kolory w `app/support/page.tsx`:

-   `border-blue-500` - kolor contact form
-   `border-red-500` - kolor bug report

## Monitoring

### Logi w konsoli:

Oba API endpoints logują do console:

```
📧 Contact Form Submission: ...
🐛 Bug Report Submission: ...
```

### Metryki do śledzenia:

-   Liczba zgłoszeń dziennie
-   Średni czas odpowiedzi
-   Najczęstsze typy problemów
-   Top bug reports

## Security

✅ **Zaimplementowane:**

-   Walidacja danych po stronie serwera
-   Rate limiting przez Vercel (automatyczne)
-   Email validation
-   Minimum długości wiadomości

⚠️ **Do rozważenia:**

-   CAPTCHA dla zapobiegania spamowi (hCaptcha, Turnstile)
-   Rate limiting per email
-   Email verification
