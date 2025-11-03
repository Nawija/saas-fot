# Premium Minimalist Design System

## Seovileo Portfolio & Gallery Platform

> **Design Philosophy**: Elegancki, minimalistyczny, premium look dla profesjonalnych użytkowników - fotografów, projektantów, agencji eventowych, galerii mebli i innych kreatywnych profesjonalistów.

---

## 🎨 Color Palette

### Neutral Grays (Primary)

```css
/* Main Colors - Szarości jako główne kolory */
--gray-900: #111827  /* Główny tekst, nagłówki */
--gray-600: #4B5563  /* Tekst hover, secondary text */
--gray-500: #6B7280  /* Opisy, subtle text */
--gray-400: #9CA3AF  /* Placeholder, disabled */
--gray-300: #D1D5DB  /* Borders subtle */
--gray-200: #E5E7EB  /* Borders, separators */
--gray-100: #F3F4F6  /* Background subtle */
--gray-50:  #F9FAFB  /* Background light */
--white:    #FFFFFF  /* Primary background */
```

### Accent Colors (Minimal Use)

```css
/* Używaj TYLKO gdy konieczne */
--danger:  #EF4444  /* Delete buttons */
--success: #10B981  /* Success states */
--warning: #F59E0B  /* Warning states */
```

### ❌ NIE używaj:

-   Jaskrawych niebieskich
-   Fioletowych
-   Pomarańczowych
-   Żółtych jako głównych kolorów
-   Gradientów kolorowych

---

## 📝 Typography

### Font Family

```css
font-family: "Inter", system-ui, -apple-system, Segoe UI, Roboto, Ubuntu,
    Cantarell, Noto Sans, sans-serif;
```

### Font Weights

```css
font-weight: 300; /* font-light - Główne nagłówki H1, H2 */
font-weight: 400; /* font-normal - Body text */
font-weight: 500; /* font-medium - Przyciski, labels */
font-weight: 600; /* font-semibold - Rzadko (sub-headings) */
font-weight: 700; /* font-bold - NIE UŻYWAJ (zbyt agresywne) */
```

### Heading Styles

```tsx
/* H1 - Hero Headings */
<h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">
  Main Title
</h1>

/* H2 - Section Headings */
<h2 className="text-3xl font-light text-gray-900 mb-2">
  Section Title
</h2>

/* H3 - Card Titles */
<h3 className="text-xl font-light text-gray-900">
  Card Title
</h3>

/* H4 - Small Headings */
<h4 className="text-base font-medium text-gray-900">
  Small Heading
</h4>
```

### Body Text

```tsx
/* Large Body */
<p className="text-xl text-gray-600 font-light leading-relaxed">
  Large descriptive text
</p>

/* Normal Body */
<p className="text-base text-gray-500 leading-relaxed">
  Standard paragraph text
</p>

/* Small Text */
<p className="text-sm text-gray-500">
  Small supporting text
</p>

/* Extra Small / Metadata */
<p className="text-xs text-gray-400 font-medium">
  Metadata, timestamps
</p>
```

### Special Typography

```tsx
/* Monospace - URLs, code */
<span className="font-mono text-sm text-gray-400">username.seovileo.pl</span>
```

---

## 🎯 Spacing System

### Container Padding

```tsx
/* Desktop/Tablet */
className = "px-6 md:px-12";

/* Mobile */
className = "px-4 sm:px-6";
```

### Vertical Spacing

```tsx
/* Section Spacing */
py-16 md:py-20  /* Between major sections */
py-12 md:py-16  /* Between content blocks */
py-8 md:py-12   /* Smaller sections */

/* Component Spacing */
mb-12  /* Large gap between components */
mb-8   /* Medium gap */
mb-6   /* Small gap */
mb-4   /* Minimal gap */
```

### Grid Gaps

```tsx
/* Gallery Grid */
gap-8 md:gap-10   /* Premium spacing */

/* Card Grid */
gap-5 md:gap-6    /* Standard spacing */

/* Compact Grid */
gap-4             /* Compact spacing */
```

---

## 🎴 Component Patterns

### Cards - Minimalist Style

#### Gallery Card (Premium)

```tsx
<div className="bg-white overflow-hidden transition-all duration-500">
    {/* Image - No border, clean */}
    <div className="relative aspect-4/3 bg-gray-100 overflow-hidden mb-5">
        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        {/* Hover overlay - subtle */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
    </div>

    {/* Content */}
    <div className="space-y-3">
        <h3 className="text-xl font-light text-gray-900 line-clamp-1 group-hover:text-gray-600 transition-colors">
            Title
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            Description
        </p>
        {/* Separator line */}
        <div className="flex items-center text-xs text-gray-400 font-medium pt-2 border-t border-gray-100">
            Statistics
        </div>
    </div>
</div>
```

#### Standard Card

```tsx
<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300">
    {/* Content */}
</div>
```

### Buttons

#### Primary Button

```tsx
<button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
    Action
</button>
```

#### Secondary Button

```tsx
<button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
    Secondary
</button>
```

#### Danger Button

```tsx
<button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
    Delete
</button>
```

### Badges

#### Minimal Badge (Preferred)

```tsx
<span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-600 text-xs font-medium rounded-full shadow-sm">
    Label
</span>
```

#### Status Badge

```tsx
{
    /* Private */
}
<span className="px-2.5 py-1 bg-gray-900/90 text-white text-xs font-semibold rounded-lg backdrop-blur-sm">
    Private
</span>;

{
    /* Public - Usually hidden for clean look */
}
```

---

## 🖼️ Images & Media

### Aspect Ratios

```tsx
/* Portfolio/Gallery - Classic 4:3 */
className = "aspect-4/3";

/* Hero Images - 16:9 */
className = "aspect-video";

/* Squares - 1:1 */
className = "aspect-square";
```

### Image Hover Effects

```tsx
/* Standard Zoom */
className="transition-transform duration-700 group-hover:scale-105"

/* With Overlay */
<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
```

### Placeholder Images

```tsx
<div className="w-full h-full flex items-center justify-center bg-gray-100">
    <ImageIcon className="w-12 h-12 text-gray-200" />
</div>
```

---

## 🎭 Borders & Shadows

### Borders

```tsx
/* Standard Border */
border border-gray-200

/* Hover Border */
hover:border-gray-300

/* Bottom Border (Separator) */
border-b border-gray-100

/* No Border (Clean Look) */
/* Preferowane dla premium look */
```

### Shadows

```tsx
/* Subtle Shadow */
shadow - sm;

/* Hover Shadow */
hover: shadow - lg;

/* Card Shadow */
shadow - md;

/* ❌ NIE używaj shadow-xl - zbyt mocne */
```

### Rounded Corners

```tsx
/* Cards */
rounded-2xl  /* 16px - Premium look */

/* Buttons */
rounded-lg   /* 8px - Standard */

/* Badges */
rounded-full /* Pills */

/* Images */
rounded-xl   /* 12px - Soft */
```

---

## ⚡ Transitions & Animations

### Standard Transitions

```tsx
/* Quick - Buttons, hover states */
transition-colors duration-300

/* Medium - Cards, components */
transition-all duration-500

/* Slow - Images, dramatic effects */
transition-transform duration-700
```

### Loading States

```tsx
<div className="w-12 h-12 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
```

### Hover States

```tsx
/* Text Hover */
hover:text-gray-600

/* Background Hover */
hover:bg-gray-100

/* Scale Hover */
group-hover:scale-105

/* Shadow Hover */
hover:shadow-lg

/* Translate Hover */
hover:-translate-y-1  /* ❌ NIE używaj - zbyt agresywne */
```

---

## 📐 Layout Patterns

### Container Sizes

```tsx
/* Maximum Width */
max-w-7xl    /* 1280px - Standard */
max-w-6xl    /* 1152px - Narrow */
max-w-3xl    /* 768px - Content */

/* Full Width */
w-full
```

### Grid Layouts

```tsx
/* Gallery Grid - Premium */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
  {/* 3 columns on large screens */}
</div>

/* Card Grid - Standard */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
  {/* 4 columns max */}
</div>
```

### Flex Layouts

```tsx
/* Header - Space Between */
<div className="flex items-center justify-between">

/* Centered Content */
<div className="flex items-center justify-center">

/* Stack on Mobile, Row on Desktop */
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
```

---

## 🎨 Background Patterns

### Premium Backgrounds

```tsx
/* White - Clean, premium */
bg-white

/* Subtle Gradient - Elegant */
bg-linear-to-b from-white to-gray-50

/* Light Gray - Subtle */
bg-gray-50

/* ❌ NIE używaj */
/* Kolorowych gradientów, wzorów, tekstur */
```

---

## 📱 Responsive Design

### Breakpoints

```css
sm:  640px  /* Tablet portrait */
md:  768px  /* Tablet landscape */
lg:  1024px /* Desktop */
xl:  1280px /* Large desktop */
```

### Mobile First Examples

```tsx
/* Text Responsive */
<h1 className="text-3xl md:text-4xl lg:text-5xl">

/* Padding Responsive */
<div className="px-4 sm:px-6 md:px-12">

/* Grid Responsive */
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

/* Hide on Mobile */
<div className="hidden md:block">

/* Show only on Mobile */
<div className="block md:hidden">
```

---

## ✅ Do's and ❌ Don'ts

### ✅ DO:

-   Używaj `font-light` dla głównych nagłówków
-   Zachowuj dużo białej przestrzeni (spacious padding)
-   Stosuj szarości jako główne kolory
-   Używaj subtelnych hover effects (scale-105, opacity)
-   Zachowaj spójność w zaokrągleniach (rounded-2xl dla kart)
-   Używaj `leading-relaxed` dla lepszej czytelności
-   Dodawaj `transition-all duration-500` dla smooth animations
-   Używaj `line-clamp-1` lub `line-clamp-2` dla tekstów
-   Zachowaj aspect-4/3 dla galerii zdjęć
-   Używaj `backdrop-blur-sm` dla przezroczystych elementów

### ❌ DON'T:

-   Nie używaj `font-bold` (zbyt agresywne)
-   Nie używaj jaskrawych kolorów jako głównych
-   Nie używaj `shadow-xl` (zbyt mocne cienie)
-   Nie używaj kolorowych gradientów w tle
-   Nie używaj `-translate-y` hover effects
-   Nie mieszaj różnych stylów zaokrągleń
-   Nie używaj więcej niż 2-3 kolorów jednocześnie
-   Nie stosuj animacji dłuższych niż 700ms
-   Nie używaj `font-bold` w body text
-   Nie dodawaj border jeśli nie jest konieczny

---

## 🎯 Component Examples

### Hero Section

```tsx
<div className="border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-2">
            Hero Title
        </h1>
        <p className="text-xl text-gray-600 font-light leading-relaxed">
            Subtitle description
        </p>
    </div>
</div>
```

### Section with Decorative Line

```tsx
<div className="mb-12">
    <h2 className="text-3xl font-light text-gray-900 mb-2">Section Title</h2>
    <div className="w-12 h-0.5 bg-gray-900"></div>
</div>
```

### Empty State

```tsx
<div className="text-center py-32">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-6">
        <Icon className="w-8 h-8 text-gray-300" />
    </div>
    <h2 className="text-2xl font-light text-gray-900 mb-3">
        Empty State Title
    </h2>
    <p className="text-gray-400 text-sm">Supporting text</p>
</div>
```

### Loading State

```tsx
<div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-gray-50">
    <div className="text-center">
        <div className="w-12 h-12 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
    </div>
</div>
```

---

## 🎨 Usage Guidelines

### When to use this style:

1. **Public-facing pages** (portfolios, galleries)
2. **Premium features** (pro/unlimited plans)
3. **Marketing pages** (landing, pricing)
4. **Professional showcases**

### When to adapt:

1. **Dashboard** - może być trochę bardziej functional
2. **Forms** - większy kontrast dla accessibility
3. **Admin panels** - więcej informacji density

---

## 📦 Quick Reference

### Color Scale

```
Darkest → Lightest
gray-900 → gray-600 → gray-500 → gray-400 → gray-200 → gray-100 → gray-50 → white
```

### Spacing Scale

```
Extra Small → Small → Medium → Large → Extra Large
gap-4 → gap-5/6 → gap-8 → gap-10 → gap-12
```

### Font Size Scale

```
xs → sm → base → lg → xl → 2xl → 3xl → 4xl → 5xl
12px → 14px → 16px → 18px → 20px → 24px → 30px → 36px → 48px
```

---

## 🚀 Implementation Checklist

Gdy implementujesz nowy komponent, sprawdź:

-   [ ] Używam `font-light` dla nagłówków?
-   [ ] Kolory to głównie szarości?
-   [ ] Padding jest przestronny (py-16+)?
-   [ ] Transitions są smooth (duration-500/700)?
-   [ ] Border radius jest spójny (rounded-2xl)?
-   [ ] Hover effects są subtelne?
-   [ ] Line-height jest relaxed dla text?
-   [ ] Białej przestrzeni jest dużo?
-   [ ] Brak jaskrawych kolorów?
-   [ ] Mobile-first responsive?

---

## 🎓 Design Inspiration

Ten styl jest inspirowany przez:

-   **Apple Design** - Minimalizm, elegancja
-   **Stripe** - Czysty, profesjonalny
-   **Notion** - Subtelny, funkcjonalny
-   **Linear** - Smooth, premium
-   **Behance** - Kreatywny, portfolio-focused

---

**Last Updated**: November 2025
**Version**: 1.0
**Author**: Seovileo Design Team
