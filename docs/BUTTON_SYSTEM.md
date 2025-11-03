# Button System - Premium Design

## 🎨 Design Philosophy

Buttony zaprojektowane zgodnie z **DESIGN_PAGE.md** - minimalistyczne, eleganckie, premium.

Główne zasady:

-   **Neutralne kolory** - szarości i biel (gray-900 → white)
-   **Subtelne cienie** - shadow-sm → shadow-md
-   **Płynne animacje** - transition-all duration-300
-   **Rounded-lg** - konsekwentne zaokrąglenia
-   **Font-medium** - nie za mocne, nie za lekkie

---

## 📦 Varianty

### 1. **Primary** (Główna akcja)

```tsx
<MainButton label="Save Changes" variant="primary" />
```

**Style**:

-   `bg-gray-900` → `hover:bg-gray-800`
-   `text-white`
-   `shadow-sm` → `hover:shadow-md`

**Kiedy używać**:

-   Główna akcja na stronie (CTA)
-   Zapisywanie danych
-   Potwierdzanie akcji
-   Tworzenie nowych elementów

---

### 2. **Secondary** (Akcje drugorzędne)

```tsx
<MainButton label="Cancel" variant="secondary" />
```

**Style**:

-   `bg-white` → `hover:bg-gray-50`
-   `text-gray-900`
-   `border-gray-200` → `hover:border-gray-300`
-   `shadow-sm`

**Kiedy używać**:

-   Akcje pomocnicze
-   Anulowanie
-   Podgląd
-   Ustawienia

---

### 3. **Ghost** (Minimalistyczny)

```tsx
<MainButton label="Learn More" variant="ghost" />
```

**Style**:

-   `bg-transparent` → `hover:bg-gray-50`
-   `text-gray-600` → `hover:text-gray-900`
-   `border-transparent` → `hover:border-gray-200`

**Kiedy używać**:

-   Linki tekstowe
-   Akcje mniej ważne
-   Menu items
-   Subtle interactions

---

### 4. **Danger** (Akcje destruktywne)

```tsx
<MainButton label="Delete" variant="danger" />
```

**Style**:

-   `bg-white` → `hover:bg-red-50`
-   `text-red-600`
-   `border-gray-200` → `hover:border-red-200`
-   `shadow-sm`

**Kiedy używać**:

-   Usuwanie danych
-   Trwałe zmiany
-   Akcje nieodwracalne

---

### 5. **Success** (Potwierdzenie)

```tsx
<MainButton label="Confirm" variant="success" />
```

**Style**:

-   `bg-white` → `hover:bg-green-50`
-   `text-gray-900`
-   `border-gray-200` → `hover:border-green-200`
-   `shadow-sm`

**Kiedy używać**:

-   Potwierdzanie sukcesu
-   Publikowanie
-   Aktywowanie

---

## 🎯 Props

```typescript
interface MainButtonProps {
    label?: string; // Tekst przycisku
    href?: string; // Link (zamienia button w <Link>)
    onClick?: () => void; // Handler kliknięcia
    type?: "button" | "submit"; // Typ HTML
    disabled?: boolean; // Czy wyłączony
    loading?: boolean; // Stan ładowania
    loadingText?: string; // Tekst podczas ładowania
    icon?: React.ReactNode; // Ikona (Lucide)
    variant?: string; // Wariant stylu
    className?: string; // Dodatkowe klasy
    target?: "_blank" | "_self"; // Target dla linków
}
```

---

## 📋 Przykłady użycia

### Button z ikoną

```tsx
import { Plus } from "lucide-react";

<MainButton
    label="New Gallery"
    icon={<Plus className="w-4 h-4" />}
    variant="primary"
/>;
```

### Button jako link

```tsx
import { ExternalLink } from "lucide-react";

<MainButton
    label="Visit"
    href="https://example.com"
    target="_blank"
    icon={<ExternalLink className="w-4 h-4" />}
    variant="secondary"
/>;
```

### Button z loading state

```tsx
<MainButton
    label="Save"
    loading={isSaving}
    loadingText="Saving..."
    variant="primary"
    onClick={handleSave}
/>
```

### Button disabled

```tsx
<MainButton label="Submit" disabled={!isValid} variant="primary" />
```

### Icon only button

```tsx
import { Settings } from "lucide-react";

<MainButton icon={<Settings className="w-5 h-5" />} variant="secondary" />;
```

### Submit button w formularzu

```tsx
<form onSubmit={handleSubmit}>
    <MainButton label="Create Account" type="submit" variant="primary" />
</form>
```

---

## 🎨 Button Groups

### Horizontal group

```tsx
<div className="flex items-center gap-2">
    <MainButton label="Cancel" variant="secondary" />
    <MainButton label="Save" variant="primary" />
</div>
```

### Icon buttons group

```tsx
<div className="flex items-center gap-2">
    <MainButton icon={<Eye />} variant="secondary" />
    <MainButton icon={<Settings />} variant="secondary" />
    <MainButton icon={<Trash2 />} variant="danger" />
</div>
```

### Full width mobile

```tsx
<div className="flex flex-col sm:flex-row gap-2">
    <MainButton
        label="Cancel"
        variant="secondary"
        className="w-full sm:w-auto"
    />
    <MainButton
        label="Continue"
        variant="primary"
        className="w-full sm:w-auto"
    />
</div>
```

---

## ✅ Do's

-   ✅ Używaj `variant="primary"` dla głównej akcji
-   ✅ Używaj `variant="secondary"` dla akcji drugorzędnych
-   ✅ Używaj `variant="ghost"` dla minimalistycznych interakcji
-   ✅ Dodawaj ikony z Lucide Icons
-   ✅ Używaj `loading` state dla async actions
-   ✅ Używaj `disabled` gdy akcja niemożliwa
-   ✅ Dodawaj `className` tylko gdy konieczne
-   ✅ Używaj `target="_blank"` dla linków zewnętrznych

---

## ❌ Don'ts

-   ❌ Nie używaj wielu `primary` buttonów obok siebie
-   ❌ Nie łącz `href` i `onClick` jednocześnie
-   ❌ Nie używaj `orange`, `purple`, `teal` - to legacy variants
-   ❌ Nie dodawaj custom colorów - trzymaj się gray scale
-   ❌ Nie używaj `font-bold` - mamy `font-medium`
-   ❌ Nie dodawaj dodatkowych cieni poza `shadow-sm/md`
-   ❌ Nie używaj animacji translate-y na hover

---

## 🔄 Migracja ze starych buttonów

### Przed (stary styl)

```tsx
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
    Click me
</button>
```

### Po (nowy styl)

```tsx
<MainButton label="Click me" variant="primary" />
```

---

## 🎯 Hierarchia wizualna

**Strona z wieloma akcjami**:

```tsx
{/* 1. Główna akcja - Primary */}
<MainButton label="Save Changes" variant="primary" />

{/* 2. Akcje drugorzędne - Secondary */}
<MainButton label="Preview" variant="secondary" />
<MainButton label="Settings" variant="secondary" />

{/* 3. Akcje minimalne - Ghost */}
<MainButton label="Learn more" variant="ghost" />

{/* 4. Akcje destruktywne - Danger (oddzielone) */}
<MainButton label="Delete" variant="danger" />
```

---

## 📱 Responsive Design

### Desktop

```tsx
<MainButton label="Create Gallery" icon={<Plus />} variant="primary" />
```

### Mobile (full width)

```tsx
<MainButton
    label="Create Gallery"
    icon={<Plus />}
    variant="primary"
    className="w-full"
/>
```

### Adaptive (auto)

```tsx
<MainButton
    label="Create Gallery"
    icon={<Plus />}
    variant="primary"
    className="w-full sm:w-auto"
/>
```

---

## 🚀 Custom Styling

### Padding

```tsx
{/* Default: px-4 py-2 */}
<MainButton className="px-6 py-3" /> {/* Larger */}
<MainButton className="px-3 py-1.5" /> {/* Smaller */}
```

### Width

```tsx
<MainButton className="w-full" />      {/* Full width */}
<MainButton className="w-40" />        {/* Fixed width */}
<MainButton className="min-w-32" />    {/* Min width */}
```

### Text size

```tsx
<MainButton className="text-xs" />     {/* Small */}
<MainButton className="text-base" />   {/* Default */}
<MainButton className="text-lg" />     {/* Large */}
```

---

## 🎨 Accessibility

-   **Focus ring**: Automatyczny focus-ring przy Tab navigation
-   **Disabled state**: Opacity 50% + cursor-not-allowed
-   **Loading state**: Spinner + aria-label="Loading"
-   **Labels**: Zawsze dodawaj `label` lub `aria-label`

```tsx
{
    /* Icon only - add aria-label */
}
<MainButton
    icon={<Settings />}
    variant="secondary"
    className="aria-label-settings"
/>;
```

---

## 📊 Performance

-   **Code splitting**: Komponenty są automatycznie code-splitted
-   **Tree shaking**: Nieużywane varianty są usuwane
-   **Bundle size**: ~2KB (gzipped)

---

**Last Updated**: November 2025
**Version**: 2.0 (Premium Design)
**Status**: Production Ready ✅
