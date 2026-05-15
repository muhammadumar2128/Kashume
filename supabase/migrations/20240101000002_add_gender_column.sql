-- Add gender column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Unisex';
