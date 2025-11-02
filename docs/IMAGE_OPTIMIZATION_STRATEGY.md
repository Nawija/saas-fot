# Image Optimization Strategy - SaaS Application

## 🎯 Cel: Minimalizacja kosztów Vercel przy zachowaniu wydajności

W aplikacji SaaS z dużą ilością zdjęć użytkowników, kluczowe jest unikanie kosztów optymalizacji obrazów przez Vercel.

## 📊 Strategia: Kiedy używać Next.js Image vs Native img

### ✅ Używaj Next.js `<Image>` dla:

1. **Statycznych obrazów aplikacji**

    - Logo, ikony, ilustracje
    - Obrazy w landing page
    - Marketing assets
    - Ograniczona liczba (~10-50 obrazów)

2. **Hero images** (już zoptymalizowane)
    - Przetwarzane przez Sharp na serwerze
    - Zapisane jako WebP w optymalnych rozmiarach
    - Serwowane bezpośrednio z R2
    - Next.js Image tylko dla `priority` i lazy loading

**Dlaczego?**

-   Mała liczba statycznych obrazów = niskie koszty
-   Next.js automatycznie generuje responsive variants
-   Build-time optimization = szybkie pierwsze ładowanie

---

### ✅ Używaj natywnego `<img>` dla:

1. **User-generated content (zdjęcia użytkowników)**

    - Dashboard photos grid ✅ **ZMIENIONE**
    - Gallery photos (publiczne galerie)
    - Avatar images
    - Wszystkie zdjęcia z R2

2. **Duże wolumeny obrazów**
    - Tysiące zdjęć od setek użytkowników
    - Dynamiczna zawartość

**Dlaczego?**

-   ✅ **Zero kosztów Vercel** - obrazy z R2/CDN
-   ✅ **Unlimited** - brak limitów
-   ✅ **Szybsze** - bezpośrednie połączenie z CDN
-   ✅ **Cloudflare R2 = darmowy egress**

---

## 🏗️ Aktualna implementacja

### 1. PhotosGrid (Dashboard) ✅ ZOPTYMALIZOWANE

**Przed:**

```tsx
<Image src={photo.file_path} fill sizes="..." loading="lazy" />
// Problem: Każde zdjęcie = request do Vercel Image Optimization
```

**Po:**

```tsx
<img
    src={photo.file_path}
    loading="lazy"
    decoding="async"
    className="absolute inset-0 w-full h-full object-cover"
/>
// Rozwiązanie: Bezpośrednio z R2 CDN, zero kosztów Vercel
```

**Benefity:**

-   ✅ Zachowany lazy loading (`loading="lazy"`)
-   ✅ Async decoding (`decoding="async"`)
-   ✅ Loading states (skeleton)
-   ✅ Error handling
-   ✅ Zero kosztów optymalizacji

---

### 2. Gallery Photos (Publiczne galerie)

**Lokalizacja:** `/app/g/[slug]/p/page.tsx`

**Obecnie:** Next.js Image component

**Rekomendacja:** Zmienić na `<img>` z lazy loading

**Powód:**

-   Publiczne galerie = najwięcej wyświetleń
-   Setki zdjęć na galerię × setki galerii = tysiące obrazów
-   Każde wyświetlenie = request do Vercel = koszty

**Przykład:**

```tsx
// PRZED (kosztowne):
<Image src={photo.file_path} fill loading="lazy" />

// PO (darmowe):
<img
    src={photo.file_path}
    loading="lazy"
    decoding="async"
    className="w-full h-full object-cover"
/>
```

---

### 3. Hero Images ✅ JUŻ OPTYMALNE

**Lokalizacja:** `/components/gallery/hero/ResponsiveHeroImage.tsx`

**Status:** Używa Next.js Image, ale to OK bo:

-   Obrazy są pre-processed przez Sharp
-   Już w WebP i optymalnych rozmiarach
-   Ograniczona liczba (1-2 na galerię)
-   Next.js tylko dla responsive loading

**Nie zmieniać** - działa idealnie!

---

## 📋 TODO: Optymalizacja galerii publicznych

### Plik do zmiany: `/app/g/[slug]/p/page.tsx`

**Obecny kod (linie ~450-500):**

```tsx
<Image
    src={photo.file_path}
    alt={`Photo ${index + 1}`}
    fill
    sizes="..."
    loading="lazy"
/>
```

**Zmienić na:**

```tsx
<img
    src={photo.file_path}
    alt={`Photo ${index + 1}`}
    loading="lazy"
    decoding="async"
    className="w-full h-full object-cover"
    onLoad={() => handleImageLoad(photo.id)}
    onError={() => handleImageError(photo.id)}
/>
```

**Dodać state management:**

```tsx
const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
const [errorImages, setErrorImages] = useState<Set<number>>(new Set());
```

---

## 💰 Szacowane oszczędności

### Vercel Pro Plan Limits:

-   **Image Optimization**: 5,000 source images/month
-   **Bandwidth**: 1 TB/month

### Scenariusz bez optymalizacji (Next.js Image wszędzie):

-   **100 użytkowników** × 50 zdjęć = 5,000 zdjęć
-   **10,000 wyświetleń/miesiąc** = 10,000 × $0.005 = **$50/miesiąc**
-   **Przekroczenie limitu** już przy 100 użytkownikach!

### Scenariusz z optymalizacją (img + R2 CDN):

-   **Hero images**: ~100 × 2 = 200 optymalizacji = **$1/miesiąc**
-   **User photos**: 0 optymalizacji (bezpośrednio z R2)
-   **R2 egress**: **$0** (Cloudflare darmowy egress)
-   **Razem**: **~$1/miesiąc** niezależnie od liczby użytkowników! 🎉

### Oszczędności: **~$50-500+/miesiąc** w zależności od skali

---

## 🚀 Plan implementacji

### Priorytet 1: ✅ Dashboard PhotosGrid (DONE)

-   [x] Zmieniono z Next.js Image na `<img>`
-   [x] Zachowano lazy loading i error handling
-   [x] Zero kosztów Vercel

### Priorytet 2: 🔄 Gallery Photos (TODO)

-   [ ] Zmienić `/app/g/[slug]/p/page.tsx`
-   [ ] Użyć natywnego `<img>` z lazy loading
-   [ ] Dodać state management dla loading/error
-   [ ] Testować na różnych urządzeniach

### Priorytet 3: ✅ Hero Images (DONE - nie zmieniać)

-   [x] Używa Next.js Image (OK - małe wolumeny)
-   [x] Pre-processed przez Sharp
-   [x] Optymalne rozmiary WebP

---

## 🛠️ Best Practices

### 1. Zawsze używaj lazy loading

```tsx
<img loading="lazy" decoding="async" />
```

### 2. Obsługuj błędy ładowania

```tsx
<img
    onError={(e) => {
        e.currentTarget.src = "/placeholder.jpg";
    }}
/>
```

### 3. Loading states

```tsx
{
    isLoading && <div className="skeleton-loader" />;
}
<img
    style={{ opacity: isLoading ? 0 : 1 }}
    onLoad={() => setIsLoading(false)}
/>;
```

### 4. Optymalizuj obrazy na serwerze (Sharp)

-   Użytkownicy uploadują oryginały
-   Sharp generuje WebP w optymalnych rozmiarach
-   Zapisz do R2
-   Serwuj bezpośrednio

### 5. Cloudflare R2 konfiguracja

```
- Public access: Enabled
- CORS: Skonfigurowany dla twojej domeny
- Cache Control: max-age=31536000 (1 rok)
- Egress: Darmowy (Cloudflare CDN)
```

---

## 📊 Monitoring

### Metryki do śledzenia:

1. **Vercel Dashboard:**

    - Image Optimization count
    - Bandwidth usage
    - Koszty miesięczne

2. **Cloudflare R2:**

    - Storage used
    - Request count
    - Egress (powinien być $0)

3. **Performance:**
    - Lighthouse scores
    - Core Web Vitals
    - LCP (Largest Contentful Paint)

---

## ⚠️ Kiedy NIE używać `<img>`?

1. **Landing page z marketingowymi obrazami**

    - Niewielka liczba statycznych obrazów
    - Potrzebujesz automatycznych responsive variants
    - Next.js Image = wygoda

2. **Bardzo ważne hero sections na stronie głównej**

    - Krytyczne dla First Contentful Paint
    - Next.js Image z `priority={true}`
    - Automatyczny blur placeholder

3. **Obrazy wymagające wielu rozmiarów**
    - Gdy potrzebujesz 5+ wariantów jednego obrazu
    - Next.js automatycznie generuje srcset

---

## 🎓 Podsumowanie

| Typ obrazu         | Komponent | Optymalizacja | Koszty Vercel |
| ------------------ | --------- | ------------- | ------------- |
| **User photos**    | `<img>`   | Sharp → R2    | **$0** ✅     |
| **Gallery public** | `<img>`   | Sharp → R2    | **$0** ✅     |
| **Hero images**    | `<Image>` | Sharp → R2    | **~$1** ✅    |
| **Static assets**  | `<Image>` | Next.js       | **~$1** ✅    |
| **Landing page**   | `<Image>` | Next.js       | **~$2** ✅    |

**Total:** **~$4/miesiąc** niezależnie od skali użytkowników! 🎉

---

## 📚 Dodatkowe zasoby

-   [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
-   [Sharp Image Processing](https://sharp.pixelplumbing.com/)
-   [Next.js Image Optimization Pricing](https://vercel.com/docs/image-optimization)
-   [Native lazy loading](https://web.dev/browser-level-image-lazy-loading/)

---

**Last Updated:** November 2, 2025  
**Status:** Dashboard optimized ✅ | Gallery public - TODO 🔄
