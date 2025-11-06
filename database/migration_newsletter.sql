-- Migration: Newsletter System
-- Description: Creates tables for newsletter subscribers and messages
-- Created: 2025-11-06

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto extension for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table for newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  unsubscribe_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = true;

-- Table for newsletter messages
CREATE TABLE IF NOT EXISTS newsletter_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for getting latest newsletter
CREATE INDEX IF NOT EXISTS idx_newsletter_messages_created ON newsletter_messages(created_at DESC);

-- Comments
COMMENT ON TABLE newsletter_subscribers IS 'Stores email addresses for newsletter subscription';
COMMENT ON TABLE newsletter_messages IS 'Stores newsletter content created by admin';
COMMENT ON COLUMN newsletter_subscribers.unsubscribe_token IS 'Unique token for unsubscribe functionality';
COMMENT ON COLUMN newsletter_subscribers.is_active IS 'Allows soft deletion - set to false to unsubscribe';
