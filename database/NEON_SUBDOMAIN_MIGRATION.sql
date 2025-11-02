-- ============================================
-- SUBDOMAIN MIGRATION FOR NEON DATABASE
-- ============================================
-- Run this SQL directly in Neon Console
-- https://console.neon.tech/

-- Step 1: Add subdomain column
ALTER TABLE collections ADD COLUMN IF NOT EXISTS subdomain VARCHAR(63);

-- Step 2: Create unique index (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_subdomain 
ON collections(subdomain) 
WHERE subdomain IS NOT NULL;

-- Step 3: Add column comment (optional, for documentation)
COMMENT ON COLUMN collections.subdomain IS 'Custom subdomain for gallery, e.g. "wedding" in wedding.seovileo.pl';

-- Step 4: Verify migration
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'collections' 
AND column_name = 'subdomain';

-- Step 5: Verify index
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'collections'
AND indexname = 'idx_collections_subdomain';

-- ============================================
-- Expected Results:
-- ============================================
-- Query 1 (column): Should return 1 row with subdomain column details
-- Query 2 (index): Should return 1 row with index definition
-- ============================================
