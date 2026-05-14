-- Migration: Add bundle support to products table

-- 1. Add is_bundle column
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bundle BOOLEAN DEFAULT false;

-- 2. Add original_price column (optional but useful for showing discounts on bundles)
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);

-- 3. Update RLS policies (optional, but good to ensure everything is synced)
-- Policies are already set to 'authenticated' for all columns, so this is just for reference.
