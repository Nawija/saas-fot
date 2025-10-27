# Hero Templates - Łatwe dodawanie nowych szablonów

## 📁 Struktura

```
components/dashboard/hero-templates/
├── types.ts                    # Typy TypeScript
├── registry.tsx                # GŁÓWNY REJESTR - tutaj dodajesz nowe szablony
├── MinimalTemplate.tsx         # Przykład szablonu
├── FullscreenTemplate.tsx
├── SplitTemplate.tsx
├── OverlayTemplate.tsx
├── GradientTemplate.tsx
└── README.md                   # Ten plik
```

## 🚀 Jak dodać nowy szablon?

### Krok 1: Stwórz nowy plik szablonu

Utwórz np. `MyAwesomeTemplate.tsx`:

```tsx
// components/dashboard/hero-templates/MyAwesomeTemplate.tsx
import { HeroTemplateProps } from "./types";

export function MyAwesomeDesktop({
    title,
    description,
    image,
}: HeroTemplateProps) {
    return (
        <div className="absolute inset-0 bg-purple-600">
            <h1 className="text-4xl font-bold text-white">{title}</h1>
            {description && <p className="text-white/80">{description}</p>}
            {image && <img src={image} alt={title} className="..." />}
        </div>
    );
}

export function MyAwesomeMobile({
    title,
    description,
    image,
}: HeroTemplateProps) {
    return (
        <div className="absolute inset-0 bg-purple-600">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {/* Wersja mobilna - mniejsze fonty, inne layout */}
        </div>
    );
}
```

### Krok 2: Dodaj do rejestru

Otwórz `registry.tsx` i:

1. **Zaimportuj** swoje komponenty:

```tsx
import { MyAwesomeDesktop, MyAwesomeMobile } from "./MyAwesomeTemplate";
```

2. **Dodaj** do tablicy `HERO_TEMPLATES`:

```tsx
export const HERO_TEMPLATES: HeroTemplateDefinition[] = [
    // ...istniejące szablony...
    {
        key: "my-awesome", // Unikalny klucz (bez spacji)
        label: "Mój Awesome", // Nazwa wyświetlana w UI
        Desktop: MyAwesomeDesktop, // Komponent desktop
        Mobile: MyAwesomeMobile, // Komponent mobile
    },
];
```

### Krok 3: Gotowe! 🎉

**To wszystko!** Twój nowy szablon automatycznie:

-   ✅ Pojawi się w selectorze szablonów
-   ✅ Będzie dostępny w podglądzie desktop i mobile
-   ✅ Zadziała na stronie publicznej galerii
-   ✅ Zostanie zapisany w bazie danych

## 📝 Dobre praktyki

### Props które dostajesz:

```tsx
interface HeroTemplateProps {
    title: string; // Zawsze jest
    description?: string; // Opcjonalny
    image?: string; // Opcjonalny (URL do obrazka)
}
```

### Wskazówki:

-   **Desktop**: Większy tekst, więcej przestrzeni, pełny ekran
-   **Mobile**: Mniejsze fonty, pionowy layout, dostosowane do telefonu
-   **Fallback**: Zawsze sprawdzaj `image` i `description` (mogą być undefined)
-   **Klasy**: Używaj Tailwind CSS (projekt ma to skonfigurowane)
-   **Layout**: Użyj `absolute inset-0` dla pełnoekranowych layoutów

### Przykład z fallbackami:

```tsx
export function MyDesktop({ title, description, image }: HeroTemplateProps) {
    return (
        <div className="absolute inset-0">
            {/* Fallback jeśli brak obrazka */}
            {image ? (
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600" />
            )}

            {/* Zawsze pokazuj tytuł */}
            <h1>{title}</h1>

            {/* Opcjonalny opis */}
            {description && <p>{description}</p>}
        </div>
    );
}
```

## 🎨 Inspiracje

Zobacz istniejące szablony jako przykłady:

-   `MinimalTemplate` - prosty, czysty design
-   `FullscreenTemplate` - pełnoekranowy z gradienty
-   `SplitTemplate` - podział 50/50 tekst/obraz
-   `OverlayTemplate` - obraz z tekstem na dole
-   `GradientTemplate` - gradient + okrągły obrazek

## 🔧 Debug

Jeśli coś nie działa:

1. Sprawdź czy zaimportowałeś komponenty w `registry.tsx`
2. Sprawdź czy `key` jest unikalny
3. Sprawdź czy oba komponenty (Desktop i Mobile) są eksportowane
4. Otwórz dev tools i sprawdź błędy w konsoli

## 📦 Gdzie to jest używane?

Szablony są automatycznie używane w:

-   `/app/dashboard/collections/[id]/page.tsx` - edycja kolekcji (podgląd)
-   `/components/dashboard/HeroPreview.tsx` - komponent podglądu
-   `/app/gallery/[slug]/page.tsx` - publiczna strona galerii (opcjonalnie)

Wszystko działa przez `getTemplateByKey(key)` z rejestru!
