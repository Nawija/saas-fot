-- Dodaj kolumny do tabeli users dla subskrypcji
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_limit BIGINT DEFAULT 2147483648; -- 2GB w bajtach
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP;

-- Tabela dla kolekcji (galerii) klientów
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    hero_image TEXT,
    subdomain VARCHAR(63),
    password_hash TEXT,
    password_plain TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_subdomain ON collections(subdomain) WHERE subdomain IS NOT NULL;

-- Tabela dla zdjęć w kolekcjach
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Denormalized like counter to avoid expensive COUNT(*) queries on photo_likes
ALTER TABLE photos ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_photos_collection_id ON photos(collection_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);

-- Tabela dla polubień zdjęć przez gości
CREATE TABLE IF NOT EXISTS photo_likes (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    guest_session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(photo_id, guest_session_id)
);

CREATE INDEX IF NOT EXISTS idx_photo_likes_photo_id ON photo_likes(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_likes_session ON photo_likes(guest_session_id);

-- Tabela dla webhooków Lemon Squeezy
CREATE TABLE IF NOT EXISTS lemon_squeezy_webhooks (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON lemon_squeezy_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_webhooks_created_at ON lemon_squeezy_webhooks(created_at);

-- Tabela dla kodów resetowania hasła
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON password_reset_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_codes(expires_at);
