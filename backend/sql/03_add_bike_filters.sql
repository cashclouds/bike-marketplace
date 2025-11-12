-- Add new columns for advanced bike filtering
-- This migration adds wheel_size and frame_size columns to the listings table

ALTER TABLE listings
ADD COLUMN IF NOT EXISTS wheel_size VARCHAR(10),
ADD COLUMN IF NOT EXISTS frame_size VARCHAR(10),
ADD COLUMN IF NOT EXISTS frame_material VARCHAR(100);

-- Create indexes for new columns for better filter performance
CREATE INDEX IF NOT EXISTS idx_listings_wheel_size ON listings(wheel_size);
CREATE INDEX IF NOT EXISTS idx_listings_frame_size ON listings(frame_size);
CREATE INDEX IF NOT EXISTS idx_listings_frame_material ON listings(frame_material);
