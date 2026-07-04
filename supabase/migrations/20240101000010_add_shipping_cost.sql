-- Add per-product shipping cost column
-- Default 199 so existing products retain current behavior
-- 0 = Free Shipping, any positive value = shipping cost in PKR
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 199;
