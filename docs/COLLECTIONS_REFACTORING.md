# Collections Page Refactoring

## 🎯 Overview

Complete refactoring of `/app/dashboard/collections/page.tsx` following **Design System principles** and **DRY methodology**.

---

## 📦 Component Structure

### Before

```
page.tsx (300+ lines)
├── All logic inline
├── Repeated UI patterns
├── Mixed concerns
└── Hardcoded styles
```

### After

```
page.tsx (50 lines) - Clean orchestrator
├── PageHeader
├── PublicGalleryBanner
├── EmptyState
├── CollectionCard
├── useCollections (hook)
└── Collection (type)
```

---

## 🔧 New Components

### 1. **PageHeader** (`/components/dashboard/PageHeader.tsx`)

**Purpose**: Reusable page header with title, description, and action button

**Props**:

-   `title: string` - Main heading
-   `description: string` - Subtitle
-   `actionLabel: string` - Button text
-   `actionHref: string` - Button link

**Design System compliance**:

-   ✅ `font-light` for title (text-4xl md:text-5xl)
-   ✅ Gray colors (text-gray-900, text-gray-500)
-   ✅ Generous spacing (mb-12 md:mb-16)
-   ✅ Responsive design (flex-col md:flex-row)

**Usage**:

```tsx
<PageHeader
    title="Galleries"
    description="Manage your photo collections"
    actionLabel="New Gallery"
    actionHref="/dashboard/collections/new"
/>
```

---

### 2. **PublicGalleryBanner** (`/components/dashboard/PublicGalleryBanner.tsx`)

**Purpose**: Display user's public gallery link with visit button

**Props**:

-   `username: string` - User's subdomain

**Design System compliance**:

-   ✅ Minimal border (border-gray-200)
-   ✅ Subtle shadow (shadow-sm, hover:shadow-md)
-   ✅ Rounded corners (rounded-2xl)
-   ✅ Monospace font for URL (font-mono)
-   ✅ Gray icon background (bg-gray-100)

**Features**:

-   Responsive layout (flex-col sm:flex-row)
-   Truncated URL on mobile
-   Hover transitions (duration-300)

---

### 3. **CollectionCard** (`/components/dashboard/CollectionCard.tsx`)

**Purpose**: Display individual collection with image, stats, and actions

**Props**:

-   `collection: Collection` - Collection data
-   `username?: string` - For public URL generation
-   `onDelete: (id, name) => void` - Delete handler

**Design System compliance**:

-   ✅ Premium look - no border, clean
-   ✅ aspect-video for hero image
-   ✅ Image zoom on hover (scale-105, duration-700)
-   ✅ Subtle overlay (bg-black/5)
-   ✅ Font-light for title (text-xl)
-   ✅ Border-top separator (border-gray-100)
-   ✅ Text colors: gray-900, gray-400

**Features**:

-   Responsive image with fallback
-   Public/Protected badge
-   Photo count display
-   Action buttons: View, Settings, Delete
-   Smooth transitions (duration-500)

**Layout**:

```tsx
<div className="group bg-white overflow-hidden transition-all duration-500">
    {/* Image - aspect-video */}
    {/* Content - space-y-3 */}
    {/* Stats - border-top separator */}
    {/* Actions - flex gap-2 */}
</div>
```

---

### 4. **EmptyState** (`/components/dashboard/EmptyState.tsx`)

**Purpose**: Show when no collections exist

**Props**:

-   `icon?: ReactNode` - Custom icon
-   `title: string` - Main message
-   `description: string` - Supporting text
-   `actionLabel: string` - CTA button text
-   `actionHref: string` - CTA button link

**Design System compliance**:

-   ✅ Large padding (py-32)
-   ✅ Font-light for title (text-2xl)
-   ✅ Gray colors (gray-900, gray-400, gray-300)
-   ✅ Rounded icon container (rounded-2xl, bg-gray-50)
-   ✅ Subtle icon (text-gray-300)

---

## 🪝 Custom Hook

### **useCollections** (`/hooks/useCollections.ts`)

**Purpose**: Separate data fetching and state management from UI

**Returns**:

```typescript
{
    collections: Collection[];
    loading: boolean;
    username: string;
    fetchCollections: () => Promise<void>;
    deleteCollection: (id: number) => Promise<void>;
}
```

**Features**:

-   Automatic data fetching on mount
-   Error handling with console logs
-   Toast notifications on delete
-   Optimistic UI updates (filter deleted item)
-   Clean separation of concerns

**Benefits**:

-   ♻️ Reusable across pages
-   🧪 Easier to test
-   📝 Better code organization
-   🔄 Can be extended with more methods

---

## 📐 Type Definitions

### **Collection** (`/types/collection.ts`)

```typescript
export interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string;
    hero_image_mobile?: string;
    is_public: boolean;
    password_plain?: string;
    photo_count?: number;
    created_at: string;
}
```

**Benefits**:

-   ✅ Single source of truth
-   ✅ Type safety across components
-   ✅ Easier to maintain
-   ✅ Autocomplete in IDE

---

## 🎨 Design System Implementation

### Color Palette

```css
/* Used throughout */
--gray-900: #111827  /* Headings, primary text */
--gray-700: #374151  /* Icons */
--gray-500: #6B7280  /* Descriptions */
--gray-400: #9CA3AF  /* Metadata */
--gray-300: #D1D5DB  /* Borders subtle */
--gray-200: #E5E7EB  /* Card borders */
--gray-100: #F3F4F6  /* Icon backgrounds */
--gray-50:  #F9FAFB  /* Page background */
```

### Typography

```tsx
/* Headers */
text-4xl md:text-5xl font-light tracking-tight  // H1
text-2xl font-light                               // H2
text-xl font-light                                // H3

/* Body */
text-xl font-light leading-relaxed  // Large description
text-sm text-gray-400               // Small metadata
font-mono text-sm                    // URLs, code
```

### Spacing

```tsx
/* Page */
py-12 md:py-16  // Section padding
px-6 md:px-12   // Container padding

/* Components */
gap-8 md:gap-10  // Grid gap (premium)
mb-12 md:mb-16   // Section margins
space-y-3        // Content spacing
```

### Transitions

```tsx
transition-all duration-500      // Cards, containers
transition-transform duration-700 // Images
transition-colors duration-300    // Text, buttons
```

### Hover Effects

```tsx
group-hover:scale-105           // Image zoom
group-hover:text-gray-600       // Text color
hover:shadow-md                  // Shadow lift
bg-black/0 group-hover:bg-black/5  // Subtle overlay
```

---

## 📊 Page Layout

### Structure

```tsx
<div className="min-h-screen bg-linear-to-b from-white to-gray-50">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        {username && <PublicGalleryBanner />}
        <PageHeader />
        {collections.length === 0 ? <EmptyState /> : <Grid />}
    </div>
    <ConfirmDialog />
</div>
```

### Grid Layout

```tsx
/* Premium spacing - following Design System */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
    {collections.map((collection) => (
        <CollectionCard />
    ))}
</div>
```

**Breakpoints**:

-   Mobile: 1 column
-   Tablet (md: 768px): 2 columns
-   Desktop (lg: 1024px): 3 columns

**Spacing**: `gap-8 md:gap-10` - premium spacing per Design System

---

## ♻️ DRY Principles Applied

### 1. **Component Extraction**

**Before**: Repeated card markup for each collection
**After**: Single `<CollectionCard />` component

### 2. **Hook Abstraction**

**Before**: API calls and state management in page
**After**: `useCollections()` hook handles all data logic

### 3. **Type Reusability**

**Before**: Interface defined in multiple files
**After**: Single `Collection` type in `/types/collection.ts`

### 4. **Utility Patterns**

**Before**: Hardcoded calculations
**After**: Reusable functions in hook

```typescript
const freedSpaceMB = Math.round((data.freedSpace / 1024 / 1024) * 10) / 10;
```

### 5. **Consistent Styling**

**Before**: Inline Tailwind classes repeated
**After**: Design System patterns in reusable components

---

## 📈 Metrics

### Code Reduction

```
page.tsx:        300+ lines → 50 lines (83% reduction)
Components:      0 → 4 reusable components
Custom Hooks:    0 → 1
Type Definitions: Inline → Centralized
```

### Maintainability

-   ✅ Single Responsibility Principle
-   ✅ Separation of Concerns
-   ✅ Type Safety
-   ✅ Reusable Components
-   ✅ Testable Logic

### Performance

-   ✅ Same bundle size (components tree-shaken)
-   ✅ Better code splitting opportunities
-   ✅ Memoization potential (React.memo for cards)

---

## 🧪 Testing Strategy

### Component Tests

```typescript
// CollectionCard.test.tsx
test("displays collection name", () => {
    render(<CollectionCard collection={mockCollection} />);
    expect(screen.getByText("Test Gallery")).toBeInTheDocument();
});

test("calls onDelete with correct params", () => {
    const onDelete = jest.fn();
    render(<CollectionCard onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(1, "Test Gallery");
});
```

### Hook Tests

```typescript
// useCollections.test.ts
test("fetches collections on mount", async () => {
    const { result } = renderHook(() => useCollections());
    await waitFor(() => {
        expect(result.current.collections).toHaveLength(3);
    });
});
```

---

## 🚀 Future Enhancements

### Potential Improvements

1. **Search/Filter**: Add `<SearchBar />` component
2. **Sorting**: Sort by date, name, photo count
3. **Bulk Actions**: Select multiple collections
4. **Drag & Drop**: Reorder collections
5. **View Toggle**: Grid/List view switcher
6. **Pagination**: Load more collections
7. **Collection Templates**: Quick start templates
8. **Analytics**: View stats per collection

### Additional Components

```tsx
<SearchBar onSearch={handleSearch} />
<FilterDropdown options={['All', 'Public', 'Private']} />
<ViewToggle view={view} onChange={setView} />
<BulkActions selected={selected} />
```

---

## 📝 Migration Guide

### For Other Pages

**Step 1**: Extract components

```typescript
// Identify repeated patterns
// Create component in /components/dashboard/
// Add TypeScript props interface
// Apply Design System styles
```

**Step 2**: Create hook

```typescript
// Extract data fetching logic
// Add error handling
// Return clean interface
```

**Step 3**: Update page

```typescript
// Import new components and hooks
// Replace inline code
// Keep page as orchestrator only
```

**Step 4**: Add types

```typescript
// Create interface in /types/
// Export and import
// Ensure type safety
```

---

## ✅ Checklist for Future Refactoring

When refactoring other pages, ensure:

-   [ ] Components are under 100 lines
-   [ ] Single Responsibility Principle
-   [ ] Design System compliance (font-light, gray colors, generous spacing)
-   [ ] TypeScript types are centralized
-   [ ] Custom hooks for data logic
-   [ ] Responsive design (mobile-first)
-   [ ] Accessibility (ARIA labels, keyboard nav)
-   [ ] Error boundaries
-   [ ] Loading states
-   [ ] Empty states

---

## 📚 References

-   [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Full design guidelines
-   [React Component Patterns](https://reactpatterns.com/)
-   [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
-   [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Last Updated**: November 2025
**Author**: Seovileo Dev Team
**Version**: 1.0
