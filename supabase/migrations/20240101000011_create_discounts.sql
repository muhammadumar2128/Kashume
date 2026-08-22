-- Migration for Discounts System
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  product_id TEXT NOT NULL DEFAULT 'all', -- 'all' or specific product UUID
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and grant full read/write access so discounts show on all mobile devices and web browsers
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Discounts" ON discounts;
DROP POLICY IF EXISTS "Admin All Discounts" ON discounts;
DROP POLICY IF EXISTS "Allow All Access to Discounts" ON discounts;

CREATE POLICY "Allow All Access to Discounts" ON discounts 
FOR ALL 
USING (true) 
WITH CHECK (true);

