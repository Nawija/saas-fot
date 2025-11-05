# Collection Components

Zmodularyzowane komponenty dla strony szczegółów kolekcji z profesjonalną architekturą.

## 📁 Struktura

```
components/dashboard/collections/
├── index.ts                      # Główny eksport (komponenty, typy)
├── types.ts                      # Wspólne typy TypeScript
├── README.md                     # Ta dokumentacja
├── ARCHITECTURE.md               # Szczegóły architektury
│
└── UI Components/
    ├── CollectionStats.tsx           # Statystyki kolekcji
    ├── HeroTemplateCard.tsx          # Karta z podglądem szablonu Hero
    ├── CollectionActions.tsx         # Przyciski akcji
    ├── CollectionSidebar.tsx         # Lewa kolumna
    ├── CollectionGallerySection.tsx  # Sekcja galerii
    └── UploadErrorsList.tsx          # Lista błędów uploadu

hooks/ (główny folder projektu)
├── useCollectionData.ts          # Zarządzanie danymi kolekcji
├── usePhotoUpload.ts             # Upload zdjęć z kompresją
├── useHeroSettings.ts            # Ustawienia Hero
└── useCollectionSettings.ts      # Ustawienia kolekcji
```

## 🎨 Komponenty UI

### CollectionStats

Wyświetla statystyki kolekcji w karcie.

**Props:**

-   `photosCount: number` - liczba zdjęć
-   `totalSize: number` - całkowity rozmiar w bajtach
-   `createdAt: string` - data utworzenia

### HeroTemplateCard

Karta z podglądem szablonu Hero i przyciskami edycji.

**Props:**

-   `heroImage: string` - URL obrazu Hero
-   `collectionName: string` - nazwa kolekcji
-   `templateLabel: string` - nazwa aktywnego szablonu
-   `onEditImage: () => void` - callback edycji obrazu
-   `onEditTemplate: () => void` - callback edycji szablonu

### CollectionActions

Panel z przyciskami akcji dla kolekcji.

**Props:**

-   `isPublic: boolean` - czy kolekcja jest publiczna
-   `photosCount: number` - liczba zdjęć
-   `galleryUrl: string` - URL galerii
-   `onEditTemplate: () => void` - edycja szablonu
-   `onEditImage: () => void` - edycja obrazu Hero
-   `onEditSettings: () => void` - edycja ustawień
-   `onDownloadAll: () => void` - pobierz wszystkie zdjęcia

### CollectionSidebar

Główna kolumna boczna łącząca template, akcje i statystyki.

**Props:**

-   `collection: Collection` - obiekt kolekcji
-   `photos: Photo[]` - tablica zdjęć
-   `templateLabel: string` - nazwa szablonu
-   `galleryUrl: string` - URL galerii
-   `onEditTemplate, onEditImage, onEditSettings, onDownloadAll` - callbacki

### CollectionGallerySection

Sekcja z galerią zdjęć i przyciskiem usuwania wszystkich.

**Props:**

-   `photos: Photo[]` - tablica zdjęć
-   `onDeletePhoto: (photoId: number) => void` - callback usuwania pojedynczego zdjęcia
-   `onDeleteAll: () => void` - callback usuwania wszystkich zdjęć

### UploadErrorsList

Lista błędów uploadu z podsumowaniem i szczegółami.

**Props:**

-   `errors: UploadError[]` - tablica błędów
-   `onClose: () => void` - zamknięcie listy

## 🎣 Custom Hooks

**Location:** `/hooks/` (główny folder projektu)

Hooki związane z kolekcjami zostały przeniesione do głównego folderu `/hooks/` zgodnie z konwencją Next.js/React.

### Dostępne hooki:

-   `useCollectionData` - Zarządzanie danymi kolekcji i zdjęć
-   `usePhotoUpload` - Upload zdjęć z automatyczną kompresją
-   `useHeroSettings` - Ustawienia Hero (szablon, font, obraz)
-   `useCollectionSettings` - Ustawienia kolekcji (publiczność, hasło)

**Szczegółowa dokumentacja:** Zobacz `/hooks/README.md`

## 🔄 Przepływ danych

```
page.tsx (główny komponent)
  ├── useCollectionData() → zarządza danymi
  ├── usePhotoUpload() → upload zdjęć
  ├── useHeroSettings() → edycja Hero
  └── useCollectionSettings() → ustawienia kolekcji

CollectionSidebar
  ├── HeroTemplateCard → podgląd szablonu
  ├── CollectionActions → akcje (edycja, pobieranie)
  └── CollectionStats → statystyki

Main Content
  ├── CopyLinkButton → kopiowanie linku
  ├── PhotoUploadSection → upload
  ├── UploadErrorsList → błędy uploadu
  └── CollectionGallerySection → galeria zdjęć
```

## ✅ Zalety modularyzacji

1. **Separation of Concerns** - każdy komponent odpowiada za jedną rzecz
2. **Reusability** - komponenty można łatwo użyć w innych miejscach
3. **Testability** - łatwiejsze testowanie pojedynczych komponentów
4. **Maintainability** - łatwiejsza nawigacja i edycja kodu
5. **Performance** - możliwość optymalizacji pojedynczych komponentów
6. **Type Safety** - jasne interfejsy props
7. **Code Organization** - logiczne grupowanie funkcjonalności

## 🚀 Użycie

### Single Import Pattern (Recommended)

```tsx
import {
    // UI Components
    CollectionSidebar,
    CollectionGallerySection,
    UploadErrorsList,
    // Hooks
    useCollectionData,
    usePhotoUpload,
    useHeroSettings,
    useCollectionSettings,
    // Types
    type Collection,
    type Photo,
    type UploadError,
} from "@/components/dashboard/collections";

// W komponencie
const { collection, photos, loading } = useCollectionData(collectionId);
const { uploading, uploadPhotos } = usePhotoUpload(collectionId);
```

### Selective Import Pattern

```tsx
// Import tylko hooków
import {
    useCollectionData,
    usePhotoUpload,
} from "@/components/dashboard/collections/hooks";

// Import tylko komponentów
import {
    CollectionSidebar,
    UploadErrorsList,
} from "@/components/dashboard/collections";

// Import tylko typów
import type {
    Collection,
    Photo,
} from "@/components/dashboard/collections/types";
```

## 🏗️ Architektura

### Separation of Concerns

1. **UI Components** (`*.tsx`) - Prezentacja i interakcja
2. **Hooks** (`hooks/*.ts`) - Logika biznesowa i state management
3. **Types** (`types.ts`) - Wspólne typy i interfejsy

### Design Patterns

-   **Container/Presentational Pattern** - Hooki jako kontenery, komponenty jako prezentacja
-   **Single Responsibility** - Każdy plik odpowiada za jedną rzecz
-   **DRY (Don't Repeat Yourself)** - Wspólne typy w jednym miejscu
-   **Barrel Exports** - Pojedynczy punkt importu przez `index.ts`
