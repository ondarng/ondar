-- ONDAR V1 - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. STORES TABLE
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    whatsapp_number TEXT NOT NULL,
    instagram_handle TEXT,
    facebook_handle TEXT,
    twitter_handle TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_account_name TEXT,
    logo_url TEXT,
    accent_color TEXT DEFAULT '#00A859',
    announcement_text TEXT,
    subscription_status TEXT DEFAULT 'TRIAL',
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + interval '14 days'),
    trust_badges TEXT[] DEFAULT ARRAY['Nationwide Delivery', '100% Original', 'Warranty']::TEXT[],
    description TEXT,
    location TEXT,
    response_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Run this to update existing stores table if already created:
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#00A859';
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS description TEXT;
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS location TEXT;
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS response_time TEXT;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category TEXT,
    stock_quantity INTEGER DEFAULT 0,
    variants JSONB DEFAULT '[]'::jsonb,
    additional_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Run this to update existing products table if already created:
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS additional_images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(12, 2) NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    customer_instagram TEXT,
    delivery_address TEXT,
    specification TEXT,
    status TEXT CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED')) DEFAULT 'PENDING',
    vendor_notes TEXT,
    payment_receipt_url TEXT,
    customer_note TEXT,
    payment_method TEXT DEFAULT 'bank_transfer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrations for existing orders table:
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_note TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank_transfer';


-- 4. LEADS TABLE (CRM)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_phone TEXT,
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT CHECK (status IN ('NEW', 'CONTACTED', 'NEGOTIATING', 'PAID', 'DELIVERED', 'CLOSED')) DEFAULT 'NEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS)

-- STORES: Vendors can only view/edit their own store
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage their own store" ON stores
    FOR ALL USING (auth.uid() = vendor_id)
    WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Public can view stores" ON stores
    FOR SELECT USING (true);

-- PRODUCTS: Vendors manage their own; public can view
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage their own products" ON products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.vendor_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.vendor_id = auth.uid())
    );
CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

-- ORDERS: Vendors view/manage their store's orders; public can create
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can view their store's orders" ON orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.vendor_id = auth.uid())
    );
CREATE POLICY "Vendors can update their store's orders" ON orders
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.vendor_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.vendor_id = auth.uid())
    );
CREATE POLICY "Vendors can delete their store's orders" ON orders
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.vendor_id = auth.uid())
    );
CREATE POLICY "Public can create orders" ON orders
    FOR INSERT WITH CHECK (true);

-- 5. FUNCTION: Decrement stock on PAID status
-- We'll handle this via a trigger or a secure RPC call later if needed, 
-- but manual stock management is safer for V1 MVP.
-- 4. STORAGE POLICIES (Run these to allow image uploads)
-- Note: Make sure you have created the 'product-images' bucket in the Storage tab first!

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

-- Allow everyone to view images
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'product-images');

-- Allow users to delete their own images
CREATE POLICY "Allow users to delete their images" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- 5. PUBLIC ACCESS POLICIES (Critical for customer-facing storefront)

-- Allow anyone to view stores (public storefront)
CREATE POLICY "Allow public store viewing" ON public.stores
FOR SELECT TO anon, authenticated USING (true);

-- Allow anyone to view products (public storefront)
CREATE POLICY "Allow public product viewing" ON public.products
FOR SELECT TO anon, authenticated USING (true);

-- Allow anyone to place an order (customers are NOT logged in)
CREATE POLICY "Allow anonymous order placement" ON public.orders
FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow authenticated vendors to view their store's orders
CREATE POLICY "Allow vendors to view orders" ON public.orders
FOR SELECT TO authenticated USING (
  store_id IN (SELECT id FROM public.stores WHERE vendor_id = auth.uid())
);

-- Allow authenticated vendors to update their store's orders
CREATE POLICY "Allow vendors to update orders" ON public.orders
    FOR UPDATE TO authenticated USING (
      store_id IN (SELECT id FROM public.stores WHERE vendor_id = auth.uid())
    );

-- Allow anonymous customers to update pending orders via checkout link
CREATE POLICY "Allow anonymous to update pending orders" ON public.orders
    FOR UPDATE TO anon, authenticated
    USING (status = 'PENDING')
    WITH CHECK (status = 'PENDING');

-- CRM CUSTOMERS table RLS policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous to create customers" ON public.customers
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow vendors to view their customers" ON public.customers
    FOR SELECT TO authenticated USING (
      store_id IN (SELECT id FROM public.stores WHERE vendor_id = auth.uid())
    );
CREATE POLICY "Allow vendors to manage their customers" ON public.customers
    FOR ALL TO authenticated 
    USING (store_id IN (SELECT id FROM public.stores WHERE vendor_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE vendor_id = auth.uid()));

-- LEADS: Vendors view their store's leads; public can create
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can view their store's leads" ON leads
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = leads.store_id AND stores.vendor_id = auth.uid())
    );
CREATE POLICY "Vendors can update their store's leads" ON leads
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = leads.store_id AND stores.vendor_id = auth.uid())
    );
CREATE POLICY "Public can create leads" ON leads
    FOR INSERT WITH CHECK (true);

-- 7. VENTS TABLE (Vendor Feedback / Stress Log)
CREATE TABLE IF NOT EXISTS vents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    route TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VENTS POLICIES: Vendors can insert and view their own vents
ALTER TABLE vents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can insert vents" ON vents
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors can view their own vents" ON vents
    FOR SELECT TO authenticated USING (auth.uid() = vendor_id);

-- 8. EXTENSIONS & MIGRATIONS (V1.1)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS enable_direct_checkout BOOLEAN DEFAULT true;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS enable_whatsapp_checkout BOOLEAN DEFAULT true;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS announcement_text TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS require_sender_name BOOLEAN DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS receipt_send_whatsapp BOOLEAN DEFAULT true;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS receipt_send_email BOOLEAN DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS hero_banner_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS hero_title TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS hero_banner_link TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS hero_button_text TEXT;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_instagram TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS specification TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sender_name TEXT;


-- 9. RESET ALL TRIAL PERIODS TO 14 DAYS FROM NOW
-- Run this query in Supabase SQL Editor to extend/reset all existing stores to a 14-day free trial:
UPDATE stores SET trial_ends_at = NOW() + INTERVAL '14 days', subscription_status = 'TRIAL';


-- 10. REVIEWS TABLE (Real customer ratings)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT 'Verified Buyer',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read all reviews
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);

-- Anyone can insert a review (customers submit after order)
CREATE POLICY "Anyone can submit a review" ON reviews FOR INSERT WITH CHECK (true);

-- Only store owner can delete reviews
CREATE POLICY "Store owner can delete reviews" ON reviews FOR DELETE USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = auth.uid())
);


-- 11. STORE VIEWS / ANALYTICS TABLE & STORE COLUMNS
ALTER TABLE stores ADD COLUMN IF NOT EXISTS delivery_zones JSONB DEFAULT '[]'::jsonb;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS footer_bg_color TEXT DEFAULT '#090D16';

CREATE TABLE IF NOT EXISTS store_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  visitor_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE store_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store views readable by store vendor" ON store_views FOR SELECT USING (true);
CREATE POLICY "Anyone can log a store view" ON store_views FOR INSERT WITH CHECK (true);


-- Anyone can insert a review (customers submit after order)
CREATE POLICY "Anyone can submit a review" ON reviews FOR INSERT WITH CHECK (true);

-- Only store owner can delete reviews
CREATE POLICY "Store owner can delete reviews" ON reviews FOR DELETE USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = auth.uid())
);

-- 12. VENDOR POLLS TABLE
CREATE TABLE IF NOT EXISTS vendor_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name TEXT,
  vendor_contact TEXT,
  top_feature TEXT,
  sales_frequency TEXT,
  willingness_to_pay TEXT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE vendor_polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit poll responses" ON vendor_polls FOR INSERT WITH CHECK (true);
CREATE POLICY "Polls readable by all" ON vendor_polls FOR SELECT USING (true);

