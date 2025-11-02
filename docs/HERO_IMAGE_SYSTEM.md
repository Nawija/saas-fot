# Hero Image System - Technical Documentation

## Overview

The hero image system creates **two versions** of each hero image optimized for different devices:

-   **Desktop**: 3840x2160 (4K, Landscape 16:9) @ 92% quality
-   **Mobile**: 828x1472 (Portrait 9:16) @ 90% quality

Both versions are generated in parallel, uploaded to R2, and saved to the database. Mobile version uses **portrait orientation** (9:16) and is optimized for typical smartphone rendering (~800x1100px), providing excellent quality at smaller file size.

## Database Schema

### Migration

```sql
-- Add hero_image_mobile column
ALTER TABLE collections
ADD COLUMN IF NOT EXISTS hero_image_mobile TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_collections_hero_mobile
ON collections(hero_image_mobile)
WHERE hero_image_mobile IS NOT NULL;
```

### Collection Fields

-   `hero_image` (TEXT) - Desktop version URL
-   `hero_image_mobile` (TEXT) - Mobile version URL
-   `hero_template` (TEXT) - Template name (minimal, fullscreen, etc.)
-   `hero_font` (TEXT) - Font family (inter, playfair, poppins)

## Image Processing Flow

### 1. Client-Side: HeroImageEditor

**File**: `/components/dashboard/HeroImageEditor.tsx`

User interactions:

-   Upload image
-   Zoom (0.5x - 3x)
-   Pan (drag to reposition)
-   Rotate (0°, 90°, 180°, 270°)

Canvas rendering:

```typescript
// Generates 4K image (3840x2160) in 16:9 aspect ratio
const outputWidth = 3840;
const outputHeight = 2160;

// High quality JPEG (95%)
canvas.toBlob(
    (blob) => {
        const file = new File([blob], "hero-image.jpg", {
            type: "image/jpeg",
        });
        onImageReady(file);
    },
    "image/jpeg",
    0.95
);
```

**Why 4K?** Editor generates final composition at target resolution to avoid quality loss during Sharp upscaling.

### 2. Server-Side: Upload API

**File**: `/app/api/collections/upload/route.ts`

**Step 1: EXIF Rotation**

```typescript
const rotatedBuffer = await sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .toBuffer({ resolveWithObject: false });
```

**Step 2: Parallel Processing**

```typescript
const [heroDesktopBuffer, heroMobileBuffer] = await Promise.all([
    // Desktop - 3840x2160
    sharp(rotatedBuffer)
        .resize(3840, 2160, {
            fit: "cover", // Fill entire area, crop excess
            position: "centre", // Center during crop
            withoutEnlargement: false,
            kernel: sharp.kernel.lanczos3, // Best quality
        })
        .webp({ quality: 92, effort: 4 })
        .toBuffer(),

    // Mobile - 828x1472 (Portrait 9:16)
    // Optimized for typical smartphone rendering (~800x1100px)
    // Vertical orientation perfect for smartphones
    sharp(rotatedBuffer)
        .resize(828, 1472, {
            fit: "cover",
            position: "centre",
            withoutEnlargement: false,
            kernel: sharp.kernel.lanczos3,
        })
        .webp({ quality: 90, effort: 4 })
        .toBuffer(),
]);
```

**Why `fit: 'cover'`?**

-   Desktop: Maintains 16:9 landscape aspect ratio
-   Mobile: Maintains 9:16 portrait aspect ratio (perfect for phones)
-   Fills entire canvas (no letterboxing)
-   Centers the image and crops excess
-   Preserves user's composition from editor

**Step 3: Parallel Upload to R2**

```typescript
const keyDesktop = R2Paths.collectionHero(userId, collectionId);
const keyMobile = keyDesktop.replace(".webp", "-mobile.webp");

const [urlDesktop, urlMobile] = await Promise.all([
    uploadToR2(heroDesktopBuffer, keyDesktop, "image/webp"),
    uploadToR2(heroMobileBuffer, keyMobile, "image/webp"),
]);
```

**Step 4: Return Both URLs**

```typescript
return NextResponse.json({
    ok: true,
    url: urlDesktop,
    urlMobile: urlMobile,
    size: heroDesktopBuffer.length + heroMobileBuffer.length,
    width: 3840,
    height: 2160,
});
```

### 3. Database Update

**File**: `/app/api/collections/[id]/route.ts`

```typescript
// PATCH endpoint accepts both fields
const { hero_image, hero_image_mobile } = body;

if (hero_image !== undefined) {
    updates.push(`hero_image = $${paramCount++}`);
    values.push(hero_image);
}
if (hero_image_mobile !== undefined) {
    updates.push(`hero_image_mobile = $${paramCount++}`);
    values.push(hero_image_mobile);
}
```

### 4. Client-Side: Gallery Display

**File**: `/components/gallery/hero/ResponsiveHeroImage.tsx`

```tsx
export default function ResponsiveHeroImage({ desktop, mobile, alt }) {
    const mobileImage = mobile || desktop;

    return (
        <>
            {/* Mobile Image - shown on small screens */}
            <div className="md:hidden absolute inset-0">
                <Image
                    src={mobileImage}
                    alt={alt}
                    quality={75}
                    fill
                    sizes="100vw"
                />
            </div>

            {/* Desktop Image - shown on large screens */}
            <div className="hidden md:block absolute inset-0">
                <Image
                    src={desktop}
                    alt={alt}
                    quality={75}
                    fill
                    sizes="100vw"
                />
            </div>
        </>
    );
}
```

**CSS Breakpoint**: `md` (768px)

-   **< 768px**: Mobile image loads (828x1472 portrait)
-   **≥ 768px**: Desktop image loads (3840x2160 landscape)

## API Endpoints

### GET /api/gallery/[slug]

Returns collection with hero images:

```typescript
SELECT
  id, name, slug, description,
  hero_image, hero_image_mobile,
  hero_template, hero_font, is_public,
  CASE WHEN password_hash IS NOT NULL THEN true ELSE false END as has_password
FROM collections
WHERE slug = $1
```

### GET /api/gallery/[slug]/photos

Returns collection + photos:

```typescript
collection: {
  id,
  name,
  description,
  hero_image,
  hero_image_mobile,
  hero_template,
  hero_font,
}
```

### PATCH /api/collections/[id]

Updates collection:

```typescript
{
  hero_image: "https://r2.../hero.webp",
  hero_image_mobile: "https://r2.../hero-mobile.webp",
  hero_template: "minimal",
  hero_font: "inter"
}
```

## Hero Templates

All templates support responsive images via `ResponsiveHeroImage`:

### Fullscreen Template

```tsx
<ResponsiveHeroImage
    desktop={data.image}
    mobile={data.imageMobile}
    alt={data.name}
    className="object-cover"
/>
```

### Minimal & Minimal2 Templates

```tsx
<ResponsiveHeroImage
    desktop={data.image}
    mobile={data.imageMobile}
    alt={data.name}
    className="object-cover"
/>
```

## File Sizes (Typical)

| Version | Resolution | Orientation      | Quality | Format | Size      |
| ------- | ---------- | ---------------- | ------- | ------ | --------- |
| Desktop | 3840×2160  | Landscape (16:9) | 92%     | WebP   | 2-3 MB    |
| Mobile  | 828×1472   | Portrait (9:16)  | 90%     | WebP   | 80-120 KB |

## Performance Optimizations

### 1. Parallel Processing

-   Both versions process simultaneously
-   ~50% faster than sequential

### 2. Reduced Sharp Effort

-   Desktop: `effort: 4` (vs default 6)
-   Mobile: `effort: 3`
-   Faster encoding with minimal quality loss

### 3. Lazy Loading

-   Next.js Image component handles lazy loading
-   Only visible version downloads
-   `priority={true}` for hero (above fold)

### 4. Responsive Loading

-   Mobile users: ~400-600 KB instead of 2-3 MB
-   Desktop users: Full 4K quality
-   Automatic via CSS media queries

## Image Positioning

### Problem Solved

Previously, `fit: 'inside'` would shrink images to fit dimensions, causing:

-   Letterboxing (black bars)
-   Loss of user's composition
-   Different crops on desktop vs mobile

### Solution

Using `fit: 'cover'` with `position: 'centre'`:

-   ✅ Fills entire canvas (no black bars)
-   ✅ Maintains 16:9 aspect ratio
-   ✅ Centers image during crop
-   ✅ Consistent look across devices
-   ✅ Preserves user's zoom/pan from editor

### User Control

Editor provides:

-   **Zoom**: 0.5x - 3x to frame subject
-   **Pan**: Drag to reposition
-   **Rotate**: 0°, 90°, 180°, 270°
-   **Preview**: Real-time canvas update

Final composition is rendered at 4K, then Sharp applies:

```typescript
.resize(3840, 2160, {
  fit: "cover",      // Preserve aspect ratio
  position: "centre" // Center the image
})
```

## Troubleshooting

### Images not loading?

1. Check R2 bucket CORS settings
2. Verify both URLs saved to database
3. Check browser Network tab for 404s

### Wrong crop/zoom?

1. Editor generates 4K (3840x2160)
2. Sharp uses `fit: 'cover'` + `position: 'centre'`
3. User's composition is preserved

### Mobile image same as desktop?

1. Run migration: `node scripts/migrate-hero-mobile.js`
2. Verify API endpoints return `hero_image_mobile`
3. Check `ResponsiveHeroImage` receives both props

### Performance issues?

1. Use WebP format (smaller than JPEG/PNG)
2. Reduce quality if needed (85% mobile, 92% desktop)
3. Enable CDN caching on R2 bucket

## Testing Checklist

-   [ ] Upload hero image in editor
-   [ ] Zoom/pan/rotate works smoothly
-   [ ] Check R2 bucket for 2 files:
    -   `collections/123/hero.webp` (desktop)
    -   `collections/123/hero-mobile.webp` (mobile)
-   [ ] Verify database has both URLs
-   [ ] Test on desktop browser (>768px width)
-   [ ] Test on mobile browser (<768px width)
-   [ ] Check DevTools Network tab:
    -   Desktop loads 4K version
    -   Mobile loads Full HD version
-   [ ] Verify composition is consistent
-   [ ] Test with portrait/landscape images
-   [ ] Test EXIF rotation (phone photos)

## Migration Script

Run once to add `hero_image_mobile` column:

```bash
node scripts/migrate-hero-mobile.js
```

Output:

```
🚀 Running migration: hero_image_mobile...
✅ Migration completed successfully!
   - Added hero_image_mobile column to collections
   - Created index on hero_image_mobile
```

## Future Improvements

### 1. WebP with JPEG Fallback

```tsx
<picture>
    <source srcSet={mobile} type="image/webp" media="(max-width: 768px)" />
    <source srcSet={desktop} type="image/webp" />
    <img src={desktop} alt={alt} />
</picture>
```

### 2. AVIF Format

-   Smaller than WebP (~20-30%)
-   Requires Sharp configuration
-   Browser support growing

### 3. Blur Placeholder

```typescript
// Generate tiny base64 preview
const placeholder = await sharp(buffer)
    .resize(20, 11)
    .blur()
    .toBuffer()
    .then((buf) => `data:image/webp;base64,${buf.toString("base64")}`);
```

### 4. Multiple Breakpoints

-   Mobile: 640x360 (small phones)
-   Tablet: 1920x1080 (iPads)
-   Desktop: 3840x2160 (4K displays)

### 5. Smart Cropping

```typescript
// Use Sharp's attention strategy for intelligent cropping
.resize(3840, 2160, {
  fit: 'cover',
  position: sharp.strategy.attention // Focus on important areas
})
```

---

**Last Updated**: November 2, 2025
**Version**: 2.0.0
