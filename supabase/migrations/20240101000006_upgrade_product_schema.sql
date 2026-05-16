-- 1. Upgrade products table to handle complex data
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS scent_notes JSONB DEFAULT '{"top": [], "heart": [], "base": []}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS performance JSONB DEFAULT '{"longevity": "Long Lasting", "sillage": "Strong"}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping TEXT DEFAULT 'Standard shipping applies.';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false;

-- 2. Ensure RLS is updated for the new columns
-- (Usually automatic, but good to have a policy that allows all authenticated users to manage products if needed)
DROP POLICY IF EXISTS "Enable all for authenticated users" ON products;
CREATE POLICY "Enable all for authenticated users" ON products FOR ALL TO authenticated USING (true);
