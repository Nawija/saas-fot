# Hooks Documentation

Custom React hooks używane w aplikacji.

## 📂 Struktura

```
hooks/
├── index.ts                      # Barrel export wszystkich hooków
│
├── Authentication & Forms
│   ├── useLoginForm.ts
│   ├── useRegisterForm.ts
│   └── useRedirectIfAuthenticated.ts
│
├── Collections Management
│   ├── useCollections.ts         # Lista wszystkich kolekcji
│   ├── useCollectionData.ts      # Szczegóły pojedynczej kolekcji
│   ├── usePhotoUpload.ts         # Upload zdjęć z kompresją
│   ├── useHeroSettings.ts        # Ustawienia Hero image
│   └── useCollectionSettings.ts  # Ustawienia kolekcji
│
└── UI & Utilities
    ├── useInfiniteScroll.ts
    └── useLightboxUrlSync.ts
```

## 🎣 Collection Hooks

### useCollectionData

Zarządzanie danymi pojedynczej kolekcji (fetch, delete, download).

**Location:** `hooks/useCollectionData.ts`

**Import:**

```tsx
import { useCollectionData } from "@/hooks";
```

**Usage:**

```tsx
const { collection, photos, loading, deletePhoto, downloadAllPhotos } =
    useCollectionData(collectionId);
```

### usePhotoUpload

Upload zdjęć z automatyczną kompresją i obsługą błędów.

**Location:** `hooks/usePhotoUpload.ts`

**Features:**

-   🗜️ Automatyczna kompresja > 1MB
-   ⚡ Batch upload (22 równoległe)
-   📊 Progress tracking
-   ❌ Szczegółowa lista błędów

**Import:**

```tsx
import { usePhotoUpload } from "@/hooks";
```

### useHeroSettings

Zarządzanie ustawieniami Hero (szablon, font, obraz).

**Location:** `hooks/useHeroSettings.ts`

**Import:**

```tsx
import { useHeroSettings } from "@/hooks";
```

### useCollectionSettings

Zarządzanie ustawieniami kolekcji (publiczność, hasło).

**Location:** `hooks/useCollectionSettings.ts`

**Import:**

```tsx
import { useCollectionSettings } from "@/hooks";
```

## 🔐 Authentication Hooks

### useLoginForm

Logika formularza logowania.

### useRegisterForm

Logika formularza rejestracji z walidacją hasła.

### useRedirectIfAuthenticated

Automatyczne przekierowanie zalogowanych użytkowników.

## 🎨 UI Hooks

### useInfiniteScroll

Implementacja infinite scroll dla galerii.

### useLightboxUrlSync

Synchronizacja URL z otwartym lightboxem.

## 📦 Usage Patterns

### Single Import

```tsx
import { useCollectionData, usePhotoUpload, useLoginForm } from "@/hooks";
```

### Direct Import

```tsx
import { useCollectionData } from "@/hooks/useCollectionData";
```

## 🔗 Related

-   **Components:** `/components/dashboard/collections/`
-   **Types:** `/components/dashboard/collections/types.ts`
-   **Tests:** `/tests/hooks/`

## 📚 Documentation

Szczegółowa dokumentacja dla hooków związanych z kolekcjami znajduje się w:

-   `/components/dashboard/collections/README.md`
-   `/components/dashboard/collections/ARCHITECTURE.md`
