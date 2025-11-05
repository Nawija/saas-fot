# Architecture Overview

## 📊 Diagram struktury

```
components/dashboard/collections/
│
├── 📄 index.ts                    # Barrel export (single entry point)
├── 📄 types.ts                    # Shared TypeScript types
├── 📖 README.md                   # Documentation
├── 📖 ARCHITECTURE.md             # Architecture details
│
└── 🎨 UI Components/
    ├── CollectionStats.tsx        # Display statistics
    ├── HeroTemplateCard.tsx       # Hero preview card
    ├── CollectionActions.tsx      # Action buttons
    ├── CollectionSidebar.tsx      # Sidebar composition
    ├── CollectionGallerySection.tsx # Gallery display
    └── UploadErrorsList.tsx       # Error display

hooks/ (main project folder)
│
└── 🎣 Collection Hooks/
    ├── useCollectionData.ts       # Data fetching & management
    ├── usePhotoUpload.ts          # Photo upload logic
    ├── useHeroSettings.ts         # Hero customization
    └── useCollectionSettings.ts   # Collection settings
```

## 🔄 Data Flow

```
page.tsx
  │
  ├─► useCollectionData() (from @/hooks)
  │     ├─► fetchCollection()
  │     ├─► fetchPhotos()
  │     ├─► deletePhoto()
  │     ├─► deleteAllPhotos()
  │     └─► downloadAllPhotos()
  │
  ├─► usePhotoUpload() (from @/hooks)
  │     ├─► compressIfNeeded()
  │     ├─► uploadPhotos()
  │     └─► batch insert to DB
  │
  ├─► useHeroSettings() (from @/hooks)
  │     ├─► updateHeroSettings()
  │     └─► saveHeroImage()
  │
  └─► useCollectionSettings() (from @/hooks)
        └─► saveSettings()

        ↓

UI Components render with data from hooks
  │
  ├─► CollectionSidebar (from @/components/dashboard/collections)
  │     ├─► HeroTemplateCard
  │     ├─► CollectionActions
  │     └─► CollectionStats
  │
  ├─► PhotoUploadSection
  ├─► UploadErrorsList
  └─► CollectionGallerySection
```

## 🏗️ Design Principles

### 1. Separation of Concerns

-   **UI Components** (`/components/dashboard/collections/`): Tylko prezentacja (dumb components)
-   **Hooks** (`/hooks/`): Logika biznesowa i state management (smart logic)
-   **Types** (`/components/dashboard/collections/types.ts`): Wspólne typy w jednym miejscu

### 2. Single Responsibility

-   Każdy komponent = jedna odpowiedzialność
-   Każdy hook = jeden obszar funkcjonalności

### 3. DRY (Don't Repeat Yourself)

-   Wspólne typy w `types.ts`
-   Reużywalne komponenty
-   Funkcje helper w hookach

### 4. Composition over Inheritance

-   `CollectionSidebar` komponuje mniejsze komponenty
-   Hooki są niezależne i kompozowalne

### 5. Barrel Exports

-   `index.ts` jako single entry point
-   Łatwe importy: `import { ... } from '@/components/dashboard/collections'`

## 📐 Component Hierarchy

```
CollectionDetailPage (page.tsx)
├── CollectionHeader
├── CollectionSidebar
│   ├── HeroTemplateCard
│   ├── CollectionActions
│   └── CollectionStats
└── Main Content
    ├── CopyLinkButton
    ├── PhotoUploadSection
    ├── UploadErrorsList
    └── CollectionGallerySection
        └── PhotosGrid
```

## 🎯 Hook Dependencies

**Location:** All hooks are in `/hooks/` folder

```
useCollectionData (hooks/useCollectionData.ts)
  └── Dependencies: useRouter, toast
  └── Uses types from: @/components/dashboard/collections/types

usePhotoUpload (hooks/usePhotoUpload.ts)
  ├── Dependencies: useRouter, toast, browser-image-compression
  ├── Uses types from: @/components/dashboard/collections/types
  └── Calls: useCollectionData.fetchPhotos() (via callback)

useHeroSettings (hooks/useHeroSettings.ts)
  ├── Dependencies: toast
  ├── Uses types from: @/components/dashboard/collections/types
  └── Calls: setCollection (from useCollectionData)

useCollectionSettings (hooks/useCollectionSettings.ts)
  ├── Dependencies: toast
  ├── Uses types from: @/components/dashboard/collections/types
  └── Calls: setCollection (from useCollectionData)
```

## 🔒 Type Safety

All components and hooks use shared types from `types.ts`:

-   ✅ No duplicate interfaces
-   ✅ Single source of truth
-   ✅ Easy to maintain
-   ✅ IntelliSense support

## 📦 Import Strategies

### Strategy 1: Single Barrel Import (Recommended)

```tsx
import {
    CollectionSidebar,
    useCollectionData,
    type Collection,
} from "@/components/dashboard/collections";
```

### Strategy 2: Selective Imports

```tsx
import { useCollectionData } from "@/components/dashboard/collections/hooks";
import { CollectionSidebar } from "@/components/dashboard/collections";
import type { Collection } from "@/components/dashboard/collections/types";
```

### Strategy 3: Direct Imports (Not Recommended)

```tsx
import CollectionSidebar from "@/components/dashboard/collections/CollectionSidebar";
import { useCollectionData } from "@/components/dashboard/collections/hooks/useCollectionData";
```

## 🚀 Performance Optimizations

1. **Lazy Loading**: Komponenty modalne tylko gdy potrzebne
2. **Memoization**: Można dodać `React.memo()` do komponentów UI
3. **Batch Operations**: Upload i delete w partiach
4. **Compression**: Automatyczna kompresja > 1MB
5. **Parallel Uploads**: 22 równoległych uploadów

## 🧪 Testing Strategy

### Unit Tests

-   Test każdego hooka osobno
-   Mock `fetch` i `useRouter`
-   Test funkcji kompresji

### Integration Tests

-   Test przepływu danych między hookami
-   Test całej strony z hooked components

### E2E Tests

-   Test uploadu zdjęć
-   Test usuwania kolekcji
-   Test zmiany ustawień

## 📈 Metrics

### Before Refactoring

-   **page.tsx**: ~800+ linii
-   **Maintainability**: Niska (monolith)
-   **Testability**: Trudna
-   **Reusability**: Brak

### After Refactoring

-   **page.tsx**: ~380 linii (-53%)
-   **Components**: 6 plików × ~50-80 linii
-   **Hooks**: 4 pliki × ~55-260 linii
-   **Maintainability**: Wysoka (modular)
-   **Testability**: Łatwa
-   **Reusability**: Wysoka

## 🎓 Best Practices Applied

✅ Clean Code principles
✅ SOLID principles
✅ React best practices
✅ TypeScript best practices
✅ Separation of Concerns
✅ Single Responsibility
✅ DRY (Don't Repeat Yourself)
✅ KISS (Keep It Simple, Stupid)
✅ Composition over Inheritance
✅ Barrel exports pattern
