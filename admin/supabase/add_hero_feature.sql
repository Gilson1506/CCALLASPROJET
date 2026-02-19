-- Add is_hero_featured column to fairs table
ALTER TABLE fairs ADD COLUMN IF NOT EXISTS is_hero_featured BOOLEAN DEFAULT false;

-- Update existing fairs to not be featured by default (already handled by DEFAULT false, but good to be explicit for existing rows if any were null)
UPDATE fairs SET is_hero_featured = false WHERE is_hero_featured IS NULL;
