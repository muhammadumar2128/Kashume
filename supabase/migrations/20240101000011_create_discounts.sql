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

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Discounts" ON discounts FOR SELECT USING (true);
CREATE POLICY "Admin All Discounts" ON discounts FOR ALL USING (auth.role() = 'authenticated');
