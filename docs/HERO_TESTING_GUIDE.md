# Quick Testing Guide - Hero Images

## Po wykonaniu zmian, przetestuj:

### 1. ✅ Migracja bazy danych

```bash
node scripts/migrate-hero-mobile.js
```

Wynik powinien być:

```
✅ Migration completed successfully!
   - Added hero_image_mobile column to collections
   - Created index on hero_image_mobile
```

### 2. ✅ Utwórz nową galerię z hero image

1. Wejdź na `/dashboard/collections/new`
2. Kliknij "Upload Image" w sekcji hero
3. Wybierz zdjęcie (najlepiej landscape/poziome)
4. **Przetestuj editor:**
    - Zoom in/out (mousewheel lub przyciski)
    - Przeciągnij zdjęcie (pan)
    - Obróć (jeśli potrzeba)
    - Zobacz podgląd w czasie rzeczywistym
5. Kliknij "Save" lub "Create Gallery"

### 3. ✅ Sprawdź R2 bucket

Powinny być **2 pliki**:

```
collections/[user_id]/[collection_id]/hero.webp          (3840x2160, ~2-3MB)
collections/[user_id]/[collection_id]/hero-mobile.webp   (1920x1080, ~400-600KB)
```

### 4. ✅ Sprawdź bazę danych

```sql
SELECT hero_image, hero_image_mobile
FROM collections
WHERE id = [collection_id];
```

Obie kolumny powinny mieć URL:

```
hero_image:        https://[r2-url]/collections/.../hero.webp
hero_image_mobile: https://[r2-url]/collections/.../hero-mobile.webp
```

### 5. ✅ Test na desktopie (>768px)

1. Otwórz galerię w przeglądarce desktop
2. Otwórz DevTools → Network tab
3. Odśwież stronę
4. Sprawdź czy ładuje się:
    - `hero.webp` (desktop version, ~2-3MB)
    - **NIE** `hero-mobile.webp`
5. Obraz powinien być ostry (4K quality)

### 6. ✅ Test na mobile (<768px)

**Opcja A: DevTools Device Emulation**

1. Otwórz DevTools
2. Toggle device toolbar (Cmd+Shift+M)
3. Wybierz iPhone/Android
4. Odśwież stronę
5. Network tab powinien pokazać:
    - `hero-mobile.webp` (~400-600KB)
    - **NIE** `hero.webp` (desktop)

**Opcja B: Prawdziwy telefon**

1. Otwórz galerię na telefonie
2. Sprawdź, czy hero image się ładuje szybko
3. Jakość powinna być dobra (Full HD)

### 7. ✅ Test kompozycji obrazu

**Sprawdź czy Twoje wybranie w editorze jest zachowane:**

1. W editorze: Przybliż na twarz modela
2. Zapisz
3. Zobacz na galerii publicznej
4. **Desktop**: Twarz powinna być w centrum (tak jak wybrałeś)
5. **Mobile**: Twarz powinna być w centrum (nie przycięta dziwnie)

### 8. ✅ Test EXIF orientation

1. Zrób zdjęcie telefonem w **pionie** (portrait)
2. Wgraj jako hero image
3. Sprawdź czy:
    - Podgląd w editorze jest prawidłowy (nie obrócony)
    - Po zapisaniu zdjęcie jest prawidłowo zorientowane
    - Na galerii publicznej jest prawidłowe

### 9. ✅ Test różnych proporcji

**Zdjęcie landscape (16:9 lub szersze):**

-   Powinno wypełnić cały hero area
-   Brak czarnych pasów
-   Centrowane

**Zdjęcie portrait (pionowe):**

-   Zostanie przycięte do 16:9
-   Górna/dolna część może być obcięta
-   Centrowane wertykalnie

**Zdjęcie kwadratowe (1:1):**

-   Zostanie przycięte do 16:9
-   Lewa/prawa część może być obcięta
-   Centrowane horyzontalnie

## Problemy i rozwiązania

### Problem: "Nie widzę drugiego obrazu w R2"

**Rozwiązanie:**

1. Sprawdź czy migracja się wykonała: `node scripts/migrate-hero-mobile.js`
2. Utwórz **NOWĄ** galerię (stare nie mają mobile version)
3. Sprawdź response z `/api/collections/upload` - powinien zawierać `urlMobile`

### Problem: "Obraz jest rozciągnięty/zniekształcony"

**Rozwiązanie:**

-   Sharp używa `fit: 'cover'` który zachowuje proporcje
-   Jeśli nadal problem, sprawdź czy editor generuje 16:9 (3840x2160)

### Problem: "Mobile ładuje desktop image"

**Rozwiązanie:**

1. Sprawdź CSS breakpoint: `md:hidden` i `md:block`
2. Otwórz DevTools → Elements → Sprawdź które `<div>` jest widoczne
3. Upewnij się, że `hero_image_mobile` jest w API response

### Problem: "Zdjęcie jest przycięte inaczej niż w editorze"

**Rozwiązanie:**

-   Editor teraz generuje 4K (3840x2160)
-   Sharp używa `fit: 'cover'` + `position: 'centre'`
-   Jeśli nadal problem, może być issue z rotation/transform

### Problem: "Zdjęcie pionowe jest źle przycięte"

**Rozwiązanie:**

-   To normalne! Hero wymaga 16:9
-   Użyj zoom/pan w editorze aby wybrać najlepszy fragment
-   Możesz obrócić zdjęcie o 90° jeśli chcesz

## Performance Metrics

### Desktop (4K hero - Landscape 16:9)

-   Rozdzielczość: 3840x2160 (landscape)
-   Rozmiar: ~2-3 MB (WebP)
-   Czas ładowania (4G): ~2-4s
-   Jakość: Doskonała na dużych ekranach

### Mobile (Optimized hero - Portrait 9:16)

-   Rozdzielczość: 828x1472 (portrait)
-   Rozmiar: ~80-120 KB (WebP)
-   Czas ładowania (4G): ~0.2-0.5s
-   Jakość: Wysoka (90% quality, dopasowana do renderowania ~800x1100px)
-   **Orientacja pionowa** - idealnie dopasowana do smartfonów
-   **Lżejszy i ostrzejszy** - mniejszy rozmiar, wyższa jakość kompresji

### Tworzenie galerii

-   Czas przetwarzania: ~3-5s dla hero (oba obrazy równolegle)
-   Upload do R2: ~2-4s (zależy od połączenia)
-   **Łącznie**: ~5-9s

## Checklist przed wdrożeniem na produkcję

-   [ ] Migracja bazy wykonana na production DB
-   [ ] Przetestowano na różnych przeglądarkach (Chrome, Safari, Firefox)
-   [ ] Przetestowano na różnych urządzeniach (iPhone, Android, tablet, desktop)
-   [ ] Sprawdzono R2 CORS configuration
-   [ ] Sprawdzono R2 bucket lifecycle rules (czy stare obrazy są usuwane?)
-   [ ] Przetestowano z różnymi typami zdjęć (portrait, landscape, square)
-   [ ] Sprawdzono EXIF orientation z prawdziwych zdjęć telefonowych
-   [ ] Zmierzono performance (Lighthouse, PageSpeed Insights)
-   [ ] Sprawdzono czy stare galerie (bez mobile version) działają (fallback do desktop)
-   [ ] Backup bazy danych przed wdrożeniem

---

**Wszystkie zmiany są wstecznie kompatybilne** - stare galerie bez `hero_image_mobile` będą używać `hero_image` dla mobile.
