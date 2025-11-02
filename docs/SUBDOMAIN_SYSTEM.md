# Subdomain System Documentation

## Overview

System subdomen pozwala użytkownikom na tworzenie własnych URL dla galerii, np:

-   `wesele.seovileo.pl` zamiast `seovileo.pl/g/wesele`
-   `portfolio.seovileo.pl` zamiast `seovileo.pl/g/portfolio`

## Architecture

### Database Schema

```sql
-- Kolumna subdomain w tabeli collections
ALTER TABLE collections ADD COLUMN IF NOT EXISTS subdomain VARCHAR(63);

-- Indeks dla szybkiego wyszukiwania
CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_subdomain
ON collections(subdomain) WHERE subdomain IS NOT NULL;
```

**Constraints:**

-   Max 63 znaki (RFC 1035 DNS label limit)
-   Tylko małe litery, cyfry i myślniki
-   Musi zaczynać i kończyć się literą lub cyfrą
-   Unikalna w całej bazie danych
-   Opcjonalna (nullable)

### Backend Updates

#### 1. API Collection Update (`/api/collections/[id]/route.ts`)

```typescript
PATCH request body:
{
  "subdomain": "wesele" | null  // null = usunięcie subdomeny
}

Validation:
- Regex: /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/
- Sprawdzenie unikalności
- 409 Conflict jeśli zajęta

Response:
- 200 OK - subdomena zaktualizowana
- 400 Bad Request - nieprawidłowy format
- 409 Conflict - subdomena zajęta
```

#### 2. API Gallery Endpoints

Wszystkie gallery API endpoints obsługują query parameter `?subdomain=xyz`:

**`/api/gallery/[slug]`** - Get collection info

```typescript
// Bez subdomeny: szuka po slug
GET /api/gallery/wesele

// Z subdomeną: szuka po subdomain
GET /api/gallery/anything?subdomain=wesele
```

**`/api/gallery/[slug]/photos`** - Get photos

```typescript
GET /api/gallery/wesele/photos?subdomain=wesele
```

**`/api/gallery/[slug]/verify`** - Password verification

```typescript
POST /api/gallery/wesele/verify?subdomain=wesele
```

### Frontend Updates

#### 1. Collection Settings Modal

**Location:** `/components/dashboard/CollectionSettingsModal.tsx`

New field:

```tsx
<input
    type="text"
    value={subdomain}
    onChange={(e) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
        setSubdomain(value);
    }}
    placeholder="wesele"
    maxLength={63}
/>
```

**Features:**

-   Real-time validation (lowercase, alphanumeric, hyphens only)
-   Live preview: `wesele.seovileo.com/g/wesele`
-   Optional field - można zostawić puste

#### 2. Dashboard Collection Page

**Location:** `/app/dashboard/collections/[id]/page.tsx`

**View Gallery button:**

```tsx
<MainButton
    href={
        collection.subdomain
            ? `${origin.replace("://", `://${collection.subdomain}.`)}/g/${
                  collection.slug
              }`
            : `${origin}/g/${collection.slug}`
    }
    label="View Gallery"
/>
```

Generates:

-   With subdomain: `https://wesele.seovileo.com/g/wesele`
-   Without: `https://seovileo.com/g/wesele`

#### 3. Public Gallery Page

**Location:** `/app/g/[slug]/page.tsx`

Reads `?subdomain=xyz` from URL and passes to API calls:

```tsx
const subdomain = searchParams.get("subdomain");
const apiUrl = subdomain
    ? `/api/gallery/${slug}?subdomain=${subdomain}`
    : `/api/gallery/${slug}`;
```

### Routing & Middleware

#### Proxy Configuration

**Location:** `/proxy.ts`

**Logic:**

1. Wykryj subdomenę z hostname
2. Ignoruj: localhost, IP, www
3. Dla subdomeny:
    - Root path `/` → rewrite do `/g/[subdomain]?subdomain=xyz`
    - Inne ścieżki → dodaj `?subdomain=xyz` param

**Example:**

```
Request: https://wesele.seovileo.com/
Rewrite: /g/wesele?subdomain=wesele

Request: https://wesele.seovileo.com/p/123
Rewrite: /p/123?subdomain=wesele
```

## DNS Configuration

### Production Setup

Dla każdej subdomeny użytkownika, potrzebny jest wildcard DNS:

```
*.seovileo.com → CNAME → seovileo.com
```

**Cloudflare DNS:**

1. Dodaj rekord CNAME:
    - Type: CNAME
    - Name: `*`
    - Target: `seovileo.com`
    - Proxy: Enabled (orange cloud)

**Vercel Configuration:**

1. Project Settings → Domains
2. Dodaj domain: `*.seovileo.com`
3. Zweryfikuj DNS

## Migration

### Running Migration

```bash
# Development (local DB)
node scripts/migrate-subdomain.js

# Production (via Vercel/Railway)
# Deploy kod, następnie uruchom w konsoli lub przez SSH
```

**Migration File:** `database/migration_subdomain.sql`

**Script:** `scripts/migrate-subdomain.js`

## User Flows

### Setting Subdomain

1. User opens collection
2. Clicks "Collection settings"
3. Enters subdomain (e.g., "wesele")
4. System validates:
    - Format (lowercase, alphanumeric, hyphens)
    - Availability (unique check)
5. Saves to database
6. "View Gallery" button now shows subdomain URL

### Visiting Subdomain Gallery

1. User visits `wesele.seovileo.com`
2. Proxy detects subdomain "wesele"
3. Rewrites to `/g/wesele?subdomain=wesele`
4. Gallery page reads subdomain param
5. API fetches collection by subdomain
6. Gallery renders normally

### Removing Subdomain

1. User opens collection settings
2. Clears subdomain field
3. Saves with empty/null subdomain
4. Gallery reverts to slug-based URL: `seovileo.com/g/wesele`

## Security Considerations

### Validation

-   **Frontend:** Real-time character filtering
-   **Backend:** Strict regex validation
-   **Database:** Unique constraint

### Reserved Subdomains

Consider blocking:

-   `www`, `api`, `admin`, `dashboard`
-   `mail`, `ftp`, `smtp`, `pop`
-   Common services to prevent conflicts

Implementation example:

```typescript
const RESERVED = ["www", "api", "admin", "dashboard", "mail", "ftp"];
if (RESERVED.includes(subdomain)) {
    return createErrorResponse("This subdomain is reserved", 400);
}
```

### Rate Limiting

Consider limiting subdomain changes:

-   Max 3 changes per day
-   Prevent subdomain squatting
-   Track history in audit log

## Testing

### Local Testing

Localhost nie obsługuje subdomen standardowo. Opcje:

**Option 1: /etc/hosts**

```bash
# Add to /etc/hosts
127.0.0.1 wesele.localhost
127.0.0.1 portfolio.localhost
```

**Option 2: ngrok/localtunnel**

```bash
ngrok http 3000
# Gives: random.ngrok.io
# Can test with subdomains
```

**Option 3: Mock in code**

```typescript
// In proxy.ts for development
if (process.env.NODE_ENV === "development") {
    // Override hostname for testing
    const mockSubdomain = url.searchParams.get("mock_subdomain");
    if (mockSubdomain) {
        /* ... */
    }
}
```

### Production Testing

1. Deploy z migracją
2. Skonfiguruj wildcard DNS
3. Utwórz testową galerię z subdomeną
4. Sprawdź:
    - [ ] Routing subdomeny działa
    - [ ] API zwraca prawidłową kolekcję
    - [ ] Password protection działa
    - [ ] Zdjęcia ładują się
    - [ ] PhotoSwipe działa
    - [ ] Like system działa

## Monitoring

### Metrics to Track

-   Subdomain usage: ile galerii ma subdomenę
-   Popular subdomains: najczęściej używane nazwy
-   Conflicts: ile prób użycia zajętej subdomeny
-   Performance: czy subdomain routing jest szybki

### Queries

```sql
-- Ile galerii ma subdomenę
SELECT COUNT(*) FROM collections WHERE subdomain IS NOT NULL;

-- Top 10 subdomen
SELECT subdomain, COUNT(*)
FROM collections
WHERE subdomain IS NOT NULL
GROUP BY subdomain
ORDER BY COUNT(*) DESC
LIMIT 10;

-- Subdomeny bez galerii (orphaned)
SELECT subdomain FROM collections
WHERE subdomain IS NOT NULL
AND id NOT IN (SELECT DISTINCT collection_id FROM photos);
```

## Troubleshooting

### Subdomain Not Working

1. **Check DNS:**

    ```bash
    dig wesele.seovileo.com
    nslookup wesele.seovileo.com
    ```

2. **Check proxy logs:**

    - Czy subdomena jest wykrywana?
    - Czy rewrite działa?

3. **Check database:**
    ```sql
    SELECT id, slug, subdomain FROM collections WHERE subdomain = 'wesele';
    ```

### 409 Conflict Error

-   Subdomena już zajęta przez inną galerię
-   User musi wybrać inną nazwę
-   Consider showing "suggested alternatives"

### API Returns Wrong Collection

-   Check if `?subdomain=xyz` param is passed correctly
-   Verify API query logic (subdomain vs slug)
-   Check for duplicate subdomains in DB (shouldn't exist with UNIQUE constraint)

## Future Enhancements

### Custom Domains

Allow users to use completely custom domains:

-   `mysitie.pl` → points to their gallery
-   Requires SSL certificate generation
-   DNS verification process
-   Similar to Vercel domain system

### Subdomain Analytics

Track per-subdomain:

-   Visitors
-   Popular photos
-   Traffic sources
-   Geographic distribution

### Subdomain Marketplace

-   Transfer subdomain between users
-   Premium subdomain pricing
-   Subdomain auctions

## References

-   RFC 1035: DNS Label limits
-   Next.js Middleware/Proxy: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
-   Cloudflare Wildcard DNS: https://developers.cloudflare.com/dns/manage-dns-records/reference/wildcard-dns-records/
