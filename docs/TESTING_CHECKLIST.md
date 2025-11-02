# Testing Checklist - Image Loading Security

## ✅ Pre-Production Testing Guide

### Desktop Testing (Chrome/Firefox/Safari)

#### Dashboard - PhotosGrid

-   [ ] Photos load with smooth fade-in animation
-   [ ] Loading skeletons appear before images load
-   [ ] Error states show for broken images
-   [ ] Delete button works on hover
-   [ ] No console errors
-   [ ] Network tab shows lazy loading (images load as you scroll)

#### Public Gallery - GalleryGrid

-   [ ] Thumbnails load first, then upgrade to full resolution
-   [ ] Intersection Observer works (images load 50px before viewport)
-   [ ] Error fallback works (thumbnail → full image → error state)
-   [ ] Like button works
-   [ ] Masonry layout displays correctly
-   [ ] No layout shift during image loading

#### PhotoSwipe Gallery Page

-   [ ] Thumbnails load with skeleton animation
-   [ ] Columns display correctly (3-5 on desktop)
-   [ ] Click opens lightbox smoothly
-   [ ] Lightbox shows adjacent images preloaded
-   [ ] Error message shows for broken images in lightbox
-   [ ] URL updates with ?photo=ID parameter
-   [ ] Scroll position preserved when closing lightbox
-   [ ] Infinite scroll loads more photos
-   [ ] Progress indicator shows (X of Y photos)

#### Single Photo View

-   [ ] Loading spinner appears
-   [ ] Image loads with fade-in
-   [ ] Error state with retry button
-   [ ] Back button works
-   [ ] High-priority loading (eager)

### Mobile Testing (iOS & Android)

#### Touch Interactions

-   [ ] Swipe works in lightbox
-   [ ] Pinch to zoom works
-   [ ] Pan works when zoomed
-   [ ] No page scroll during image drag
-   [ ] Touch events don't conflict with UI

#### Performance

-   [ ] Images load quickly on 4G
-   [ ] Thumbnails used instead of full resolution
-   [ ] Smooth scrolling (60fps)
-   [ ] No memory leaks (test with 100+ photos)
-   [ ] Battery usage reasonable

#### Layout

-   [ ] Single column on small screens (< 640px)
-   [ ] Responsive images serve correct size
-   [ ] No horizontal scrolling
-   [ ] Touch targets large enough (44x44px minimum)

### Network Conditions

#### Fast Connection (WiFi/4G)

-   [ ] All images load quickly
-   [ ] No visible loading states (too fast)
-   [ ] Preloading works in lightbox

#### Slow Connection (Slow 3G)

-   [ ] Loading skeletons visible
-   [ ] Progressive loading works
-   [ ] Thumbnails load first
-   [ ] No timeout errors
-   [ ] UI remains responsive

#### Offline

-   [ ] Error states show gracefully
-   [ ] Retry button appears
-   [ ] No crashes or white screens

### Error Scenarios

#### Broken Image URLs

-   [ ] Error icon displays
-   [ ] "Failed to load" message shows
-   [ ] Layout doesn't break
-   [ ] Other images continue loading

#### Invalid Photo Data

-   [ ] Photos without width/height filtered out
-   [ ] Photos without file_path filtered out
-   [ ] Console warnings (not errors)
-   [ ] Gallery still displays valid photos

#### Upload Validation

-   [ ] Invalid file types rejected
-   [ ] Files > 50MB rejected
-   [ ] User feedback for rejected files
-   [ ] Accept only: JPEG, PNG, WebP, GIF, HEIC/HEIF

### Security Testing

#### File Upload

-   [ ] Only image files accepted
-   [ ] File type validation works (client)
-   [ ] File size validation works (client)
-   [ ] Drag & drop respects validation
-   [ ] No script execution from uploads

#### XSS Prevention

-   [ ] Image alt text properly escaped
-   [ ] No inline scripts in error messages
-   [ ] URL parameters sanitized

#### CORS

-   [ ] Images load from R2 bucket
-   [ ] No CORS errors in console
-   [ ] Cross-origin images display

### Performance Metrics

#### Lighthouse Audit

-   [ ] Performance Score: > 90
-   [ ] Accessibility Score: > 90
-   [ ] Best Practices Score: > 90
-   [ ] SEO Score: > 80

#### Core Web Vitals

-   [ ] LCP (Largest Contentful Paint): < 2.5s
-   [ ] FID (First Input Delay): < 100ms
-   [ ] CLS (Cumulative Layout Shift): < 0.1

#### Image Metrics

-   [ ] Average image load time: < 2s on 4G
-   [ ] Thumbnail size: 200-500KB
-   [ ] Full image size: 500KB-2MB
-   [ ] Error rate: < 1%

### Browser Compatibility

#### Chrome/Edge (Chromium)

-   [ ] All features work
-   [ ] No console errors
-   [ ] Hardware acceleration enabled

#### Firefox

-   [ ] All features work
-   [ ] No console warnings
-   [ ] Image loading smooth

#### Safari (macOS/iOS)

-   [ ] All features work
-   [ ] HEIC/HEIF supported
-   [ ] Touch gestures work on iOS

#### Samsung Internet (Android)

-   [ ] All features work
-   [ ] Layout correct
-   [ ] Performance good

### Edge Cases

#### Empty Gallery

-   [ ] "No photos" message displays
-   [ ] No console errors
-   [ ] UI doesn't break

#### Single Photo

-   [ ] Layout doesn't break
-   [ ] Lightbox works with 1 photo
-   [ ] No next/prev errors

#### Large Gallery (1000+ photos)

-   [ ] Infinite scroll works
-   [ ] No memory issues
-   [ ] Performance remains good
-   [ ] All photos eventually load

#### Mixed Orientations

-   [ ] Portrait images display correctly
-   [ ] Landscape images display correctly
-   [ ] Panoramas span multiple columns
-   [ ] Square images balanced

### Regression Testing

#### After Changes

-   [ ] Re-run full test suite
-   [ ] Check all user flows
-   [ ] Verify no new console errors
-   [ ] Test on mobile + desktop

### Automated Testing (Future)

#### Unit Tests

-   [ ] Photo validation function
-   [ ] Column distribution algorithm
-   [ ] URL parameter parsing
-   [ ] Error state management

#### Integration Tests

-   [ ] Image upload flow
-   [ ] Gallery display
-   [ ] Lightbox navigation
-   [ ] Infinite scroll

#### E2E Tests

-   [ ] Full user journey
-   [ ] Upload → View → Share
-   [ ] Mobile + Desktop
-   [ ] Error scenarios

---

## 🚨 Critical Issues to Watch

### Must Fix Before Production

-   [ ] Images not loading at all
-   [ ] Console errors in production
-   [ ] Memory leaks with many photos
-   [ ] Security vulnerabilities
-   [ ] Data loss on upload

### High Priority

-   [ ] Slow loading on mobile
-   [ ] Layout shifts
-   [ ] Touch gesture conflicts
-   [ ] Error states not showing

### Medium Priority

-   [ ] Loading animations too slow
-   [ ] Retry button not working
-   [ ] URL sync issues
-   [ ] Minor UI glitches

### Low Priority

-   [ ] Animation polish
-   [ ] Loading message wording
-   [ ] Icon sizes
-   [ ] Hover states

---

## 📊 Performance Benchmarks

### Target Metrics

-   **Initial Page Load:** < 3s
-   **Time to Interactive:** < 4s
-   **First Image Load:** < 1s
-   **Lightbox Open:** < 200ms
-   **Scroll FPS:** 60fps

### Memory Usage

-   **Dashboard (50 photos):** < 200MB
-   **Gallery (100 photos):** < 300MB
-   **Lightbox:** < 150MB additional

### Network Usage

-   **Initial Load:** < 2MB
-   **Per Photo Thumbnail:** 200-500KB
-   **Per Photo Full:** 500KB-2MB
-   **Infinite Scroll Batch:** < 10MB

---

## 🔧 Debug Tools

### Browser DevTools

```javascript
// Check loaded images
document.querySelectorAll("img").length;

// Check failed images
document.querySelectorAll("img[data-error]").length;

// Monitor memory
performance.memory.usedJSHeapSize / 1048576; // MB

// Check lazy loading
new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        console.log("Image loaded:", entry.name, entry.duration);
    });
}).observe({ entryTypes: ["resource"] });
```

### Network Throttling

```
Chrome DevTools > Network > Throttling
- Fast 3G: 1.6 Mbps, 562 ms latency
- Slow 3G: 400 Kbps, 2000 ms latency
- Offline: Test error states
```

### Lighthouse CLI

```bash
npm install -g lighthouse
lighthouse https://your-site.com --view
```

---

**Last Updated:** November 2, 2025
**Test Status:** Ready for QA
