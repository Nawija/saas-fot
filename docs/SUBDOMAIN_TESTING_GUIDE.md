# Testing Subdomain System on Localhost

## Setup (5 minutes)

### 1. Add Local Subdomain DNS

Edit your hosts file:

```bash
sudo nano /etc/hosts
```

Add these lines at the end:

```
127.0.0.1 wesele.localhost
127.0.0.1 portfolio.localhost
127.0.0.1 test.localhost
```

Save and exit (Ctrl+O, Enter, Ctrl+X)

**Verify it works:**

```bash
ping wesele.localhost
# Should resolve to 127.0.0.1
```

### 2. Run Development Server

```bash
npm run dev
```

## Testing Flow

### Step 1: Create Test Collection (without subdomain)

1. Go to: `http://localhost:3000/dashboard/collections`
2. Create new collection:
    - Name: "Test Wesele"
    - Slug: "wesele"
3. Upload some photos
4. Note the regular URL: `http://localhost:3000/g/wesele`

### Step 2: Add Subdomain

1. Open collection in dashboard
2. Click "Collection settings"
3. In "Custom subdomain" field, enter: `wesele`
4. You should see preview: `wesele.seovileo.com/g/wesele`
5. Click "Save changes"
6. Notice "View Gallery" button now shows subdomain URL

### Step 3: Test Subdomain Access

Open in new tab/window:

```
http://wesele.localhost:3000
```

**Expected behavior:**

-   Should show your "Test Wesele" gallery
-   Hero image loads
-   Photos display correctly
-   If password-protected, password prompt works
-   PhotoSwipe lightbox works

### Step 4: Test Direct Gallery URL

```
http://wesele.localhost:3000/g/wesele
```

**Expected behavior:**

-   Same as above - both URLs should work
-   Subdomain is passed as `?subdomain=wesele` parameter

### Step 5: Verify in Network Tab

Open browser DevTools → Network tab:

1. Visit: `http://wesele.localhost:3000`
2. Check Request URL in Network tab
3. Should see API calls like:
    - `/api/gallery/wesele?subdomain=wesele`
    - `/api/gallery/wesele/photos?subdomain=wesele`

## Debugging

### Check Proxy Logs

Look at terminal output when visiting subdomain:

```
→ subdomain detected: wesele, rewrite to /g/wesele
```

If you don't see this, proxy might not be working.

### Check Collection in Database

If you have access to Neon console:

```sql
SELECT id, name, slug, subdomain FROM collections WHERE slug = 'wesele';
```

Should return subdomain = 'wesele'

### Common Issues

**Issue: "Gallery not found"**

-   Check if subdomain was saved to database
-   Verify API is passing `?subdomain=wesele` parameter
-   Check browser console for errors

**Issue: Subdomain doesn't resolve**

-   Verify /etc/hosts was saved correctly
-   Try `ping wesele.localhost` - should be 127.0.0.1
-   Clear browser cache
-   Try different browser

**Issue: Regular localhost still works but subdomain doesn't**

-   Check proxy.ts logs in terminal
-   Verify proxy is detecting subdomain from hostname
-   Check if baseHost logic is correct for localhost

**Issue: Photos don't load**

-   Check Network tab for 404s
-   Verify R2 URLs are correct
-   Token might be missing for password-protected galleries

## Test Cases Checklist

-   [ ] Regular URL works: `localhost:3000/g/wesele`
-   [ ] Subdomain URL works: `wesele.localhost:3000`
-   [ ] Both URLs show same content
-   [ ] Hero image displays
-   [ ] Photo grid loads
-   [ ] PhotoSwipe opens on click
-   [ ] Like button works (if public)
-   [ ] Password protection works (if set)
-   [ ] Can change subdomain in settings
-   [ ] Can remove subdomain (set to empty)
-   [ ] Multiple different subdomains work
-   [ ] Subdomain uniqueness enforced (can't use taken name)

## Multiple Subdomains Test

Create 3 different collections:

1. **Collection 1:**

    - Name: "Wedding"
    - Slug: "wedding"
    - Subdomain: "wesele"
    - URL: `wesele.localhost:3000`

2. **Collection 2:**

    - Name: "Portfolio"
    - Slug: "portfolio"
    - Subdomain: "portfolio"
    - URL: `portfolio.localhost:3000`

3. **Collection 3:**
    - Name: "Birthday"
    - Slug: "birthday"
    - Subdomain: "" (empty - no subdomain)
    - URL: `localhost:3000/g/birthday`

Visit each URL and verify correct collection shows.

## Edge Cases

### Test Subdomain Conflicts

1. Create collection with subdomain "test"
2. Try to create another collection with subdomain "test"
3. Should get error: "This subdomain is already taken"

### Test Invalid Subdomains

Try these in settings (should be rejected or cleaned):

-   `WESELE` → should convert to `wesele` (lowercase)
-   `we sele` → should remove space → `wesele`
-   `wes@le` → should remove @ → `wesle`
-   `123-test` → should allow (valid)
-   `-test` → should reject (can't start with hyphen)
-   `test-` → should reject (can't end with hyphen)

### Test Password Protection

1. Set subdomain "secure"
2. Set password "test123"
3. Visit: `secure.localhost:3000`
4. Should show password prompt
5. Enter password
6. Should load gallery

## Production-like Test

To test more realistic production behavior:

1. Use ngrok:

```bash
ngrok http 3000
```

2. Get URL like: `https://abc123.ngrok.io`

3. Test with subdomain parameter:

```
https://abc123.ngrok.io/g/wesele?subdomain=wesele
```

Note: Real subdomain routing won't work with ngrok free tier.

## Performance Check

-   [ ] Subdomain routing is fast (< 50ms overhead)
-   [ ] No extra database queries
-   [ ] Images load quickly
-   [ ] No console errors
-   [ ] Memory doesn't leak over time

## Browser Compatibility

Test in:

-   [ ] Chrome/Arc
-   [ ] Safari
-   [ ] Firefox
-   [ ] Mobile Safari (via ngrok)
-   [ ] Mobile Chrome (via ngrok)

## Cleanup After Testing

Remove test entries from /etc/hosts:

```bash
sudo nano /etc/hosts
# Delete the 127.0.0.1 wesele.localhost lines
```

Or just comment them out with #:

```
# 127.0.0.1 wesele.localhost
# 127.0.0.1 portfolio.localhost
```
