-- Add sizes column to store volume and pricing data for products
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]';
