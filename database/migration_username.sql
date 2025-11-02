-- Migration: Add username to users table
-- This allows users to have custom subdomains like username.seovileo.pl

-- Step 1: Add username column
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(63);

-- Step 2: Create unique index for username
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;

-- Step 3: Add column comment
COMMENT ON COLUMN users.username IS 'Unique username for user subdomain, e.g. "john" in john.seovileo.pl';

-- Step 4: Add is_username_set flag (to track first-time setup)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_username_set BOOLEAN DEFAULT FALSE;
