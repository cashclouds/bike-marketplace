-- Migration 05: Add seller contact information fields to listings table
-- This migration adds contact methods for sellers (phone, telegram, whatsapp, email)

BEGIN;

-- Add contact fields to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS seller_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS seller_telegram VARCHAR(100),
ADD COLUMN IF NOT EXISTS seller_whatsapp VARCHAR(20),
ADD COLUMN IF NOT EXISTS seller_email VARCHAR(255);

-- Add comments for clarity
COMMENT ON COLUMN listings.seller_phone IS 'Phone number for calls and WhatsApp (international format)';
COMMENT ON COLUMN listings.seller_telegram IS 'Telegram username without @ symbol';
COMMENT ON COLUMN listings.seller_whatsapp IS 'WhatsApp number if different from phone (international format)';
COMMENT ON COLUMN listings.seller_email IS 'Email address for contact';

-- Create index on seller_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_listings_seller_email ON listings(seller_email);

-- Set default updated_at timestamp
ALTER TABLE listings
ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

COMMIT;
