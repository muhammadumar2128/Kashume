-- Add bundle_items column to store complex data for perfumes inside a bundle
ALTER TABLE products ADD COLUMN IF NOT EXISTS bundle_items JSONB DEFAULT '[]';
