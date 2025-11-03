# Pixieset-Style Layout Refactoring

## Overview

Przeprojektowanie collection detail page z nowym layoutem inspirowanym Pixieset Client Gallery:

-   **Hero template przylega do lewej strony** (sticky positioning)
-   **Floating action icons** na hover nad hero preview
-   **Side panel** (po prawej) zamiast modali
-   **Elegancki design** z płynnymi animacjami

---

## Changes Made

### 1. **New Component: HeroSidePanel** (`/components/dashboard/HeroSidePanel.tsx`)

Side panel, który wysuwa się z prawej strony ekranu po kliknięciu akcji.

**Features:**

-   Full-height slide-in panel (600-700px width)
-   Backdrop z blur effect
-   Smooth transitions (300ms)
-   3 sub-panels: ImageEditPanel, TemplatePanel, SettingsPanel

**Usage:**

```tsx
<HeroSidePanel activePanel={activePanel} onClose={() => setActivePanel(null)}>
    {activePanel === "image" && <ImageEditPanel />}
    {activePanel === "template" && <TemplatePanel />}
    {activePanel === "settings" && <SettingsPanel />}
</HeroSidePanel>
```

---

### 2. **ImageEditPanel** (Sub-component)

Panel do edycji hero image z preview i upload.

**Features:**

-   Current image preview (aspect-video)
-   Drag & drop upload area
-   Image guidelines box (recommended size, formats)
-   Upload progress indicator

**Props:**

```typescript
{
    currentImage?: string;
    onSave: (file: File) => void;
    saving: boolean;
}
```

---

### 3. **TemplatePanel** (Sub-component)

Panel wyboru template z live preview i font selection.

**Features:**

-   Large live preview (scale 0.3)
-   Font style buttons (Inter, Playfair, Poppins)
-   Template grid (2 columns)
-   Save/Reset actions
-   PRO badge dla premium templates

**Props:**

```typescript
{
    templates: Array<HeroTemplate>;
    selectedTemplate: string;
    savedTemplate: string;
    selectedFont: string;
    collectionName: string;
    collectionDescription: string;
    heroImage: string;
    onSelectTemplate: (key: string) => void;
    onSelectFont: (font: string) => void;
    onSave: () => void;
    onReset: () => void;
    saving: boolean;
}
```

---

### 4. **SettingsPanel** (Sub-component)

Panel ustawień widoczności i hasła.

**Features:**

-   Public/Private toggle buttons z ikonami
-   Password input (tylko dla private)
-   PRO badge dla password protection
-   Upgrade prompt dla free users

**Props:**

```typescript
{
    isPublic: boolean;
    passwordPlain?: string;
    userPlan?: string;
    onSave: (isPublic: boolean, password?: string) => void;
    saving: boolean;
    onUpgradeRequired?: () => void;
}
```

---

### 5. **HeroTemplateCard** (Refactored)

Kompletnie przeprojektowana jako sticky left preview z floating icons.

**New Features:**

-   Floating action icons (opacity 0 → 100 on hover)
-   5 akcji: Edit Image, Edit Template, View Gallery, Download, Settings
-   Icons: ImagePlus, Paintbrush, Eye, Download, Settings
-   White background z backdrop-blur
-   Scale effect on hover (scale-110)
-   Template info bar (template name + visibility status)
-   Green dot status indicator

**Layout:**

```
┌─────────────────────────┐
│                         │
│   Hero Preview          │
│   (aspect-video)        │  ← Floating icons on hover (top-right)
│                         │
└─────────────────────────┘
┌─────────────────────────┐
│ • Minimal      Public   │  ← Info bar
└─────────────────────────┘
```

**Props:**

```typescript
{
    currentTemplate: HeroTemplate | undefined;
    collectionName: string;
    collectionDescription: string;
    heroImage: string;
    heroFont?: string;
    onEditImage: () => void;
    onEditTemplate: () => void;
    onViewGallery: () => void;
    onDownload: () => void;
    onSettings: () => void;
    isPublic: boolean;
    photosCount: number;
}
```

---

### 6. **Page Layout** (Updated)

Nowy 2-column layout z sticky left sidebar.

**Grid Structure:**

-   **Left:** 5/12 cols (lg), 4/12 cols (xl) - Sticky hero preview + stats
-   **Right:** 7/12 cols (lg), 8/12 cols (xl) - Upload + gallery
-   Max width: 1920px (zamiast 7xl)
-   Sticky top: 24 (96px offset)

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│                     Header Bar                            │
└──────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────┐
│                     │                                    │
│  Hero Preview       │  Copy Link                         │
│  (Sticky)           │                                    │
│                     │  Upload Section                    │
│  [5 Icons]          │                                    │
│                     │  Gallery Grid                      │
│  Stats Card         │                                    │
│                     │                                    │
└─────────────────────┴────────────────────────────────────┘
                                                  ┌─────────┐
                                                  │ Panel   │
                                                  │ (Slide) │
                                                  └─────────┘
```

---

## Design System Compliance

### Colors

-   **Gray-scale:** gray-900 (text), gray-500 (secondary), gray-100 (borders)
-   **White:** bg-white, bg-white/90 (floating icons)
-   **Accent:** green-500 (status dot)

### Typography

-   **Headings:** text-2xl font-light (panel titles)
-   **Body:** text-sm font-light
-   **Labels:** text-xs uppercase tracking-wide

### Spacing

-   **Panel padding:** p-8, space-y-8
-   **Icon buttons:** p-3
-   **Gap:** gap-2 (icon stack), gap-3 (action buttons)

### Effects

-   **Shadows:** shadow-sm (cards), shadow-lg (floating icons), shadow-2xl (panel)
-   **Transitions:** duration-200 (icons), duration-300 (panel, backdrop)
-   **Scale:** scale-110 (icon hover)
-   **Backdrop:** backdrop-blur-sm
-   **Opacity:** opacity-0 → opacity-100 (icons on hover)

### Borders

-   **Radius:** rounded-2xl (preview), rounded-xl (cards), rounded-lg (buttons)
-   **Width:** border (1px), border-2 (interactive elements)
-   **Color:** border-gray-100, border-gray-200, border-gray-900 (active)

---

## State Management

### Active Panel State

```typescript
const [activePanel, setActivePanel] = useState<
    "image" | "template" | "gallery" | "download" | "settings" | null
>(null);
```

### Panel Triggers

```typescript
// Open panels
onEditImage={() => setActivePanel("image")}
onEditTemplate={() => setActivePanel("template")}
onSettings={() => setActivePanel("settings")}

// Close panel
onClose={() => setActivePanel(null)}

// Close after save
setActivePanel(null);
```

---

## User Flows

### 1. **Edit Hero Image**

1. Hover over hero preview
2. Click ImagePlus icon
3. Side panel slides in from right
4. Upload new image
5. Panel closes, preview updates

### 2. **Change Template**

1. Hover over hero preview
2. Click Paintbrush icon
3. Template panel opens
4. Select template + font
5. Live preview updates
6. Click "Save Changes"
7. Panel closes

### 3. **Update Settings**

1. Hover over hero preview
2. Click Settings icon
3. Settings panel opens
4. Toggle public/private
5. Set password (if private)
6. Click "Save Settings"
7. Panel closes

### 4. **Download Collection**

1. Hover over hero preview
2. Click Download icon
3. ZIP generation starts
4. Browser download initiated
5. Toast confirmation

### 5. **View Gallery**

1. Hover over hero preview
2. Click Eye icon
3. New tab opens with public gallery

---

## Responsive Behavior

### Desktop (lg+)

-   2-column grid (5/7 or 4/8)
-   Sticky left sidebar
-   Full-width side panel (600-700px)
-   Floating icons visible on hover

### Tablet (md)

-   Side panel: 600px width
-   Single column stack
-   Icons always visible (no hover)

### Mobile (sm)

-   Side panel: 100% width
-   Single column
-   Icons in horizontal row
-   Touch-friendly spacing

---

## Performance Optimizations

1. **Sticky Positioning:** CSS-only, no JS scroll listeners
2. **Conditional Rendering:** Only active panel content loaded
3. **Scale Transforms:** Hardware-accelerated (GPU)
4. **Backdrop:** CSS backdrop-filter (native blur)
5. **Image Loading:** Lazy loading with aspect-ratio preservation

---

## Accessibility

### Keyboard Navigation

-   **Tab:** Navigate through icon buttons
-   **Enter/Space:** Activate button
-   **Escape:** Close side panel

### ARIA Labels

```tsx
<button title="Edit Hero Image" aria-label="Edit hero image">
<button title="Edit Template" aria-label="Edit template">
<button title="View Gallery" aria-label="View gallery">
```

### Focus Management

-   Focus trap in side panel when open
-   Return focus to trigger button on close
-   Clear focus indicators (ring-2)

---

## Comparison: Before vs After

### Before

-   3 separate modals (Hero Edit, Template, Settings)
-   CollectionActionsCard component
-   Grid layout: 4/8 columns
-   Max width: 7xl (1280px)
-   Button-based actions

### After

-   1 unified side panel with 3 sub-panels
-   Integrated actions in HeroTemplateCard
-   Grid layout: 5/7 or 4/8 columns
-   Max width: 1920px
-   Icon-based floating actions

### Code Reduction

-   **Removed:** 3 modal imports
-   **Added:** 1 side panel component (with 3 sub-panels)
-   **Simplified:** Action flow (direct panel triggers)

---

## Future Enhancements

### Potential Additions

1. **Gallery preview in panel** (instead of new tab)
2. **Download progress panel** (with file list)
3. **Keyboard shortcuts** (E for edit, T for template, etc.)
4. **Panel history** (back/forward between panels)
5. **Panel animations** (slide directions, fade effects)
6. **Mobile drawer** (bottom sheet instead of side panel)

### Design Iterations

1. **Icon customization** (user-selectable icon positions)
2. **Theme variants** (dark mode support)
3. **Animation preferences** (reduce motion support)
4. **Compact mode** (smaller preview, more content)

---

## Testing Checklist

-   [ ] Hero preview sticky on scroll
-   [ ] Floating icons visible on hover
-   [ ] All 5 icons trigger correct panels
-   [ ] Panel backdrop click closes panel
-   [ ] X button closes panel
-   [ ] Image upload works in panel
-   [ ] Template selection updates preview
-   [ ] Font selection applies immediately
-   [ ] Settings save correctly
-   [ ] Download initiates from icon
-   [ ] View gallery opens new tab
-   [ ] Disabled state for download (no photos)
-   [ ] Responsive layout on mobile
-   [ ] Keyboard navigation works
-   [ ] Focus management correct
-   [ ] Toast notifications appear
-   [ ] Error handling works
-   [ ] Loading states show correctly

---

## Conclusion

Nowy design w stylu Pixieset zapewnia:

-   **Lepsze UX:** Wszystkie akcje w jednym miejscu (hero preview)
-   **Czystszy UI:** Floating icons zamiast wielu buttonów
-   **Modernizm:** Side panel zamiast modali
-   **Spójność:** Design system w całym panelu
-   **Wydajność:** Mniej komponentów, lepsza organizacja

**Wynik:** Premium, elegant, minimalist interface dla profesjonalnych fotografów.
