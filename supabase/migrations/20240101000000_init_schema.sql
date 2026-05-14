-- Kashume Luxury Perfume - Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  scent_notes JSONB DEFAULT '{"top": [], "heart": [], "base": []}',
  performance JSONB DEFAULT '{"longevity": "Long Lasting", "sillage": "Strong"}',
  shipping TEXT DEFAULT 'All Over Pakistan Product can take 3-4 days to deliver. Delivery charges are Rs.199. Free delivery for orders above 3000.',
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  is_new_arrival BOOLEAN DEFAULT false,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bundles (The "Discovery Set" Logic)
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  product_ids UUID[] NOT NULL, -- Array of product IDs that trigger this bundle
  discount_percentage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered');
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  items JSONB NOT NULL, -- Snapshot of products at time of purchase
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Promo Codes
CREATE TABLE promocodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount INTEGER NOT NULL, -- Percentage
  expiry_date TIMESTAMPTZ,
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FAQs
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- RLS POLICIES
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Bundles" ON bundles FOR SELECT USING (true);
CREATE POLICY "Public Read FAQs" ON faqs FOR SELECT USING (true);

-- Admin Full Access (Assuming an 'admin' role or specific UID check)
-- For simplicity, we check if the user is authenticated for management
CREATE POLICY "Admin All Products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Bundles" ON bundles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Promo" ON promocodes FOR ALL USING (auth.role() = 'authenticated');
