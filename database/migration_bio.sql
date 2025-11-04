-- Dodaj kolumnę bio do tabeli users
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Photo galleries & portfolio';

-- Zaktualizuj istniejących użytkowników, którzy nie mają bio
UPDATE users SET bio = 'Photo galleries & portfolio' WHERE bio IS NULL;
