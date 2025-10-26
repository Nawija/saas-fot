-- Dodaj kolumnę hero_template do tabeli collections
ALTER TABLE collections ADD COLUMN IF NOT EXISTS hero_template VARCHAR(50) DEFAULT 'minimal';

-- Możliwe wartości: 'minimal', 'fullscreen', 'split', 'overlay', 'gradient', 'cards'
