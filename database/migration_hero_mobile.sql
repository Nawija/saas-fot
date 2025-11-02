-- Migration: Add hero_image_mobile column to collections table
-- Date: 2025-11-02
-- Description: Add separate mobile hero image for better mobile performance

ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS hero_image_mobile TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_collections_hero_mobile ON collections(hero_image_mobile) WHERE hero_image_mobile IS NOT NULL;

-- Update existing collections to use same image for mobile (temporary)
-- UPDATE collections SET hero_image_mobile = hero_image WHERE hero_image IS NOT NULL AND hero_image_mobile IS NULL;
