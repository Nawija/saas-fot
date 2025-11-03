-- Dodaj kolumny pozycji hero image do tabeli collections
-- Wartości od 0 do 100 (procenty dla object-position CSS)
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS hero_image_position_x DECIMAL(5,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS hero_image_position_y DECIMAL(5,2) DEFAULT 50.00;

-- Dodaj komentarze wyjaśniające
COMMENT ON COLUMN collections.hero_image_position_x IS 'Horizontal position of hero image focal point (0-100, default 50 = center)';
COMMENT ON COLUMN collections.hero_image_position_y IS 'Vertical position of hero image focal point (0-100, default 50 = center)';
