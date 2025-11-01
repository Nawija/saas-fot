# Hero Image Editor - Documentation

## Overview

Zaawansowany edytor hero image z możliwością przesuwania myszką, obracania i kadrowania w wysokiej jakości. System umożliwia precyzyjną kontrolę nad tym, jak zdjęcie hero będzie wyświetlane w galerii.

## Funkcjonalności

### 1. **Przesuwanie obrazu myszką**

-   Drag & drop - przeciąganie obrazu w obrębie ramki
-   Real-time preview zmian pozycji
-   Smooth transitions podczas przesuwania
-   Visual feedback podczas przeciągania (kursor zmienia się na `grabbing`)

### 2. **Zoom (Skalowanie)**

-   Przyciski `+` i `-` do kontroli powiększenia
-   Zakres: 50% - 500%
-   Wyświetlanie aktualnej wartości zoom w procentach
-   Zachowanie proporcji obrazu

### 3. **Rotacja**

-   Obrót w lewo (counterclockwise) o 90°
-   Obrót w prawo (clockwise) o 90°
-   Możliwe wartości: 0°, 90°, 180°, 270°
-   Automatyczne przeliczanie skali po obrocie

### 4. **Wysoka jakość eksportu**

-   Eksport w Full HD (1920x1080px)
-   Format JPEG z jakością 95%
-   High-quality image smoothing przy skalowaniu
-   CORS support dla obrazów z R2

## Komponenty

### `HeroImageEditor.tsx`

Główny komponent edytora.

**Props:**

```typescript
interface HeroImageEditorProps {
    onImageReady: (file: File) => void; // Callback z gotowym plikiem
    initialImage?: string; // Opcjonalny URL początkowego obrazu
}
```

**Funkcje:**

-   `handleMouseDown` - rozpoczęcie przeciągania
-   `handleMouseMove` - aktualizacja pozycji podczas przeciągania
-   `handleMouseUp` - zakończenie przeciągania
-   `rotateLeft` / `rotateRight` - rotacja o 90°
-   `zoomIn` / `zoomOut` - skalowanie obrazu
-   `generateFinalImage` - export do wysokiej jakości JPEG
-   `resetTransform` - reset pozycji do początkowej

**State:**

```typescript
interface ImageTransform {
    x: number; // Pozycja X (px)
    y: number; // Pozycja Y (px)
    scale: number; // Skala (1.0 = 100%)
    rotation: number; // Rotacja (0, 90, 180, 270)
}
```

### `HeroImageEditModal.tsx`

Modal wrapper dla edytora.

**Props:**

```typescript
interface HeroImageEditModalProps {
    open: boolean;
    onClose: () => void;
    currentHeroImage?: string;
    onSave: (file: File) => Promise<void>;
    saving: boolean;
}
```

## Integracja

### W formularzu tworzenia kolekcji (`/dashboard/collections/new`)

```tsx
<HeroImageEditor onImageReady={handleImageReady} />
```

### W edycji istniejącej kolekcji (`/dashboard/collections/[id]`)

```tsx
<HeroImageEditModal
    open={heroImageEditModalOpen}
    onClose={() => setHeroImageEditModalOpen(false)}
    currentHeroImage={collection.hero_image}
    onSave={handleSaveHeroImage}
    saving={savingHeroImage}
/>
```

## Workflow użytkownika

### Tworzenie nowej galerii:

1. Użytkownik wchodzi na `/dashboard/collections/new`
2. Klika "Click to add hero image"
3. Wybiera plik z dysku
4. Edytuje pozycję, zoom i rotację
5. Zmiany są automatycznie zapisywane (debounce 300ms)
6. Po submit formularza, gotowy plik jest uploadowany do R2

### Edycja istniejącej galerii:

1. Użytkownik wchodzi na `/dashboard/collections/[id]`
2. W sekcji "Hero appearance" klika "Edit Image"
3. Otwiera się modal z aktualnym hero image
4. Edytuje pozycję, zoom i rotację
5. Klika "Save changes"
6. Nowy plik jest uploadowany do R2 i URL aktualizowany w bazie

## Techniczne szczegóły

### Canvas rendering

-   Canvas jest ukryty (`className="hidden"`)
-   Używany tylko do generowania finalnego obrazu
-   Rendering z wysoką jakością (`imageSmoothingQuality = "high"`)
-   Black background dla letterboxing

### Performance

-   Debouncing generowania obrazu (300ms)
-   Smooth transitions tylko poza przeciąganiem
-   Minimalizacja re-renderów
-   Lazy loading dla początkowego obrazu

### CORS handling

```typescript
img.crossOrigin = "anonymous";
```

Umożliwia używanie obrazów z R2 w canvas.

## UI/UX Features

### Visual feedback

-   Center guide lines (białe krzyżyk)
-   "Drag to reposition" hint
-   Live zoom percentage display
-   Live rotation degree display
-   Smooth color transitions

### Controls layout

```
[Zoom -] [100%] [Zoom +]  [Rotate ←] [0°] [Rotate →]  [Reset] [Change]
```

### Tips box

-   Instrukcje użycia
-   Informacja o jakości eksportu
-   Przyjazne dla użytkownika

## Przykładowe wartości

```typescript
// Początkowa skala (dopasowanie do kontenera + 10%)
const initialScale = Math.max(scaleX, scaleY) * 1.1;

// Output size
const outputWidth = 1920; // Full HD
const outputHeight = 1080; // 16:9 aspect ratio

// JPEG quality
const quality = 0.95; // 95%

// Debounce time
const debounceMs = 300;
```

## Obsługa błędów

### Błąd ładowania obrazu

```typescript
img.onerror = reject;
// + fallback w catch block
```

### Brak pliku

```typescript
if (!originalFile) return;
```

### Brak canvas support

```typescript
const ctx = canvas.getContext("2d");
if (!ctx) return;
```

## Future improvements

1. **Pinch to zoom** - gestures na urządzeniach mobilnych
2. **Keyboard shortcuts** - strzałki do przesuwania, +/- do zoom
3. **Grid overlay** - rule of thirds
4. **Aspect ratio presets** - 16:9, 4:3, 1:1, etc.
5. **Undo/Redo stack** - historia zmian
6. **Filters** - brightness, contrast, saturation
7. **Crop mode** - zamiast tylko kadrowania
8. **Multiple images** - galeria hero images z slideshow

## Testing checklist

-   [ ] Upload nowego obrazu
-   [ ] Przeciąganie myszką
-   [ ] Zoom in/out
-   [ ] Rotacja w lewo/prawo
-   [ ] Reset pozycji
-   [ ] Zmiana obrazu
-   [ ] Usunięcie obrazu
-   [ ] Zapisanie w formularzu new
-   [ ] Zapisanie w modal edit
-   [ ] Wysoka jakość eksportu
-   [ ] Responsive design
-   [ ] Touch events (mobile)
-   [ ] CORS dla R2 images

## Browser compatibility

-   Chrome/Edge: ✅ Full support
-   Firefox: ✅ Full support
-   Safari: ✅ Full support (wymaga CORS headers)
-   Mobile browsers: ⚠️ Wymaga touch event handling

## Dependencies

```json
{
    "lucide-react": "Icons (RotateCw, RotateCcw, ZoomIn, ZoomOut, Move)",
    "react": "Hooks (useState, useRef, useEffect, useCallback)",
    "next": "File API"
}
```

## Code quality

-   ✅ TypeScript strict mode
-   ✅ Proper types dla wszystkich props
-   ✅ useCallback dla performance
-   ✅ Cleanup w useEffect
-   ✅ Error handling
-   ✅ ARIA labels (accessibility)
-   ✅ Responsive design
-   ✅ No console.logs (tylko errors)
