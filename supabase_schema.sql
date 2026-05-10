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
    bank_name TEXT,
    bank_account_number TEXT,
    bank_account_name TEXT,
    logo_url TEXT,
    accent_color TEXT DEFAULT '#00A859',
    subscription_status TEXT DEFAULT 'TRIAL',
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + interval '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Run this to update existing stores table if already created:
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#00A859';

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(12, 2) NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    status TEXT CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS)

-- STORES: Vendors can only view/edit their own store
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage their own store" ON stores
    FOR ALL USING (auth.uid() = vendor_id);
CREATE POLICY "Public can view stores" ON stores
    FOR SELECT USING (true);

-- PRODUCTS: Vendors manage their own; public can view
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage their own products" ON products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.vendor_id = auth.uid())
    );
CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

-- ORDERS: Vendors view their store's orders; public can create
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can view their store's orders" ON orders
    FOR SELECT USING (
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
