-- Uruchom ten skrypt w swojej bazie danych Neon
-- Możesz skopiować i wkleić w Neon SQL Editor: https://console.neon.tech

-- ====================
-- MIGRACJA SUBSKRYPCJI
-- ====================

-- Dodaj kolumny do tabeli users dla subskrypcji
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_limit BIGINT DEFAULT 2147483648; -- 2GB w bajtach (darmowy plan)
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP;

-- ====================
-- TABELE DLA GALERII
-- ====================

-- Tabela dla kolekcji (galerii) zdjęć
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    hero_image TEXT,
    password_hash TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- Tabela dla zdjęć w kolekcjach
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    thumbnail_path TEXT,
    width INTEGER,
    height INTEGER,
    is_hero BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_collection_id ON photos(collection_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);

-- Tabela dla polubień zdjęć przez gości
CREATE TABLE IF NOT EXISTS photo_likes (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    guest_identifier VARCHAR(255) NOT NULL, -- IP lub cookie ID
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(photo_id, guest_identifier)
);

CREATE INDEX IF NOT EXISTS idx_photo_likes_photo_id ON photo_likes(photo_id);

-- ====================
-- TABELA WEBHOOKÓW
-- ====================

-- Tabela dla logowania webhooków Lemon Squeezy
CREATE TABLE IF NOT EXISTS lemon_squeezy_webhooks (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_event_name ON lemon_squeezy_webhooks(event_name);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON lemon_squeezy_webhooks(processed);

-- ====================
-- SPRAWDZENIE
-- ====================

-- Sprawdź czy kolumny zostały dodane
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE '%subscription%' OR column_name LIKE '%storage%' OR column_name LIKE '%lemon%'
ORDER BY ordinal_position;

-- Sprawdź utworzone tabele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ====================
-- GOTOWE!
-- ====================

-- Migracja zakończona pomyślnie ✅
