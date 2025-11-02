-- Dodanie subdomain do tabeli collections
ALTER TABLE collections ADD COLUMN IF NOT EXISTS subdomain VARCHAR(63);

-- Indeks dla szybkiego wyszukiwania po subdomenie
CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_subdomain ON collections(subdomain) WHERE subdomain IS NOT NULL;

-- Dodanie komentarza
COMMENT ON COLUMN collections.subdomain IS 'Subdomena dla galerii, np. "wesele" w wesele.seovileo.pl';
