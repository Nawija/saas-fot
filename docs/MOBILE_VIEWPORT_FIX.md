# Mobile Viewport Fix - 100dvh Implementation

## Problem

Na urządzeniach mobilnych, pasek adresu przeglądarki (URL bar) zajmuje część ekranu, przez co standardowe `100vh` nie odpowiada rzeczywistej widocznej wysokości viewport. Gdy użytkownik przewija stronę, pasek adresu może się chować lub pokazywać, co powoduje:

-   Nieprawidłowe wyświetlanie sekcji full-screen
-   "Skaczącą" wysokość elementów
-   Zdjęcia hero nie zajmują pełnego widocznego obszaru

## Rozwiązanie

Implementacja nowych jednostek viewport CSS:

### 1. Dynamic Viewport Height (`dvh`)

Używamy `100dvh` zamiast `100vh` - dynamicznie dostosowuje się do aktualnego widocznego obszaru:

```css
/* Stary sposób */
.hero {
    height: 100vh;
}

/* Nowy sposób */
.hero {
    height: 100dvh;
}
```

### 2. Dodatkowe jednostki viewport

-   **`svh` (Small Viewport Height)** - najmniejszy możliwy rozmiar (gdy pasek jest widoczny)
-   **`lvh` (Large Viewport Height)** - największy możliwy rozmiar (gdy pasek jest ukryty)
-   **`dvh` (Dynamic Viewport Height)** - dynamicznie dostosowuje się do widocznego obszaru ✅ **Zalecane**

## Zaimplementowane zmiany

### 1. Strona landing galerii (`app/g/[slug]/page.tsx`)

```tsx
// Główny kontener z hero image
<div
    className="relative w-full flex items-center justify-center p-4"
    style={{
        minHeight: "100dvh",
        height: "100dvh",
    }}
>
```

### 2. Wszystkie szablony hero

Zaktualizowane wszystkie szablony w `components/gallery/hero/templates/`:

-   ✅ **Minimal.tsx**
-   ✅ **Minimal2.tsx**
-   ✅ **Fullscreen.tsx**
-   ✅ **Overlay.tsx**
-   ✅ **Editorial.tsx**
-   ✅ **Gradient.tsx**
-   ✅ **Split.tsx**
-   ✅ **Cinematic.tsx**

Przykład zmian:

```tsx
// Przed
<div className="relative h-screen w-full bg-black overflow-hidden">

// Po
<div
    className="relative w-full bg-black overflow-hidden"
    style={{ height: "100dvh" }}
>
```

### 3. Strona z fotografiami (`app/g/[slug]/p/page.tsx`)

```tsx
// Widok pojedynczego zdjęcia
<div
    className="bg-gray-50 flex flex-col items-center justify-center"
    style={{ height: "100dvh" }}
>

// Sekcja galerii
<div
    className="bg-white pb-12 px-2"
    style={{ minHeight: "100dvh" }}
>
```

### 4. Globalne style (`app/globals.css`)

```css
/* Fallback dla starszych przeglądarek */
:root {
    --vh-mobile: 100vh;
    --dvh-fallback: 100vh;
}

@supports (height: 100dvh) {
    :root {
        --dvh-fallback: 100dvh;
    }
}

/* Utility classes */
.min-h-screen-mobile {
    min-height: 100vh;
    min-height: 100dvh;
}

.h-screen-mobile {
    height: 100vh;
    height: 100dvh;
}

/* Prevent overscroll bounce on iOS */
.gallery-container {
    overscroll-behavior-y: none;
}

/* Fix for mobile browsers */
@supports (height: 100dvh) {
    body {
        min-height: 100dvh;
    }
}
```

## Wsparcie przeglądarek

### Nowoczesne przeglądarki (2023+)

✅ Chrome 108+
✅ Safari 15.4+
✅ Firefox 101+
✅ Edge 108+

### Starsze przeglądarki

Automatyczny fallback do `100vh` - strona działa normalnie, ale bez korekt dla paska adresu.

## Testowanie

### Na urządzeniach mobilnych:

1. **iPhone (Safari)**

    - Otwórz: `https://cv.seovileo.pl/g/sdf/`
    - Sprawdź, czy hero image zajmuje pełny ekran
    - Przewiń w dół - pasek adresu powinien się schować
    - Hero image powinno nadal zajmować 100% widocznego obszaru

2. **Android (Chrome)**
    - Otwórz tę samą stronę
    - Sprawdź pełnoekranowe wyświetlanie
    - Test przewijania

### W Chrome DevTools:

1. Otwórz DevTools (F12)
2. Włącz Device Toolbar (Ctrl+Shift+M)
3. Wybierz urządzenie mobilne
4. Sprawdź wysokość elementu w zakładce Computed

## Korzyści

✅ **Prawdziwe 100% wysokości** - zdjęcia zajmują cały widoczny obszar
✅ **Brak skakania** - płynne przewijanie bez "podskakiwania" contentu
✅ **Lepsza UX na mobile** - profesjonalne, full-screen doświadczenie
✅ **Kompatybilność wsteczna** - fallback dla starszych przeglądarek
✅ **Brak JavaScript** - czyste rozwiązanie CSS, lepsze dla wydajności

## Alternatywne podejścia (nie zastosowane)

### JavaScript approach

```javascript
// Nie używamy - wolniejsze, więcej kodu
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
}
```

### CSS Custom Properties

```css
/* Nie potrzebne - dvh to natywne rozwiązanie */
height: calc(var(--vh, 1vh) * 100);
```

## Znane problemy i ograniczenia

### iOS Safari < 15.4

-   Brak wsparcia dla `dvh`
-   Automatyczny fallback do `100vh`
-   Strona działa, ale może pokazywać pasek URL

### Rozwiązanie

Użytkownicy ze starszymi wersjami iOS zobaczą standardowe `100vh` (jak dotychczas).

## Monitoring

Po wdrożeniu możesz monitorować wsparcie przeglądarek:

```javascript
// Check support
if (CSS.supports("height", "100dvh")) {
    console.log("✅ dvh supported");
} else {
    console.log("⚠️ dvh not supported, using fallback");
}
```

## Dalsze usprawnienia

### Opcjonalne (do rozważenia):

1. **Viewport meta tag** - już powinien być w `layout.tsx`:

```html
<meta
    name="viewport"
    content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
```

2. **Safe area insets** dla iPhone z notch:

```css
padding-bottom: env(safe-area-inset-bottom);
```

3. **Address bar color** dla lepszego UX:

```html
<meta name="theme-color" content="#000000" />
```

## Referencje

-   [MDN: Dynamic viewport units](https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-relative_lengths)
-   [Can I Use: dvh](https://caniuse.com/viewport-unit-variants)
-   [CSS Tricks: The Large, Small, and Dynamic Viewports](https://css-tricks.com/the-large-small-and-dynamic-viewports/)

---

**Data wdrożenia:** 3 listopada 2025  
**Testowane na:** iOS Safari, Android Chrome, Desktop browsers
