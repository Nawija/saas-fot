-- Add hero_font column to collections for typography selection
ALTER TABLE collections ADD COLUMN IF NOT EXISTS hero_font VARCHAR(50) DEFAULT 'inter';

-- Allowed values (enforced in API): 'inter', 'playfair', 'poppins'
