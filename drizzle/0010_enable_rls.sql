-- Enable Row Level Security (RLS) on all public tables
-- This ensures multi-tenant data isolation - users can only access their own store's data

-- Important: Since you're using Drizzle with a service role (bypasses RLS),
-- this protects against direct database access and adds defense-in-depth.
-- The policies check store ownership via stores.owner_user_id = auth.uid()

-- ============================================================================
-- STEP 1: Enable RLS on all tables
-- ============================================================================

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Create RLS Policies
-- ============================================================================

-- === STORES ===
-- Store owners can manage their own stores
CREATE POLICY "Owners can manage own stores" ON stores
  FOR ALL USING (owner_user_id = auth.uid());

-- Public can read active stores (for storefronts)
CREATE POLICY "Public can read active stores" ON stores
  FOR SELECT USING (status = 'active');

-- === STORE MEMBERS ===
CREATE POLICY "Store members based on store ownership" ON store_members
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
    OR user_id = auth.uid()
  );

-- === STORE CUSTOMERS ===
-- Customers can see their own record, store owners can see their store's customers
CREATE POLICY "Store owners see own customers" ON store_customers
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
    OR user_id = auth.uid()
  );

-- === PRODUCTS ===
-- Store owners can manage, public can read
CREATE POLICY "Store owners can manage products" ON products
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Public can read published products" ON products
  FOR SELECT USING (status = 'published');

-- === PRODUCT VARIANTS ===
CREATE POLICY "Store owners can manage variants" ON product_variants
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Public can read variants" ON product_variants
  FOR SELECT USING (true);

-- === CATEGORIES ===
CREATE POLICY "Store owners can manage categories" ON categories
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);

-- === ORDERS ===
-- Store owners see their store's orders, customers see their own orders
CREATE POLICY "Store owners can manage orders" ON orders
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (
    customer_id IN (SELECT id FROM store_customers WHERE user_id = auth.uid())
  );

-- === ORDER ITEMS ===
CREATE POLICY "Store owners can manage order items" ON order_items
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Customers can view own order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id IN (
        SELECT id FROM store_customers WHERE user_id = auth.uid()
      )
    )
  );

-- === CARTS ===
-- Customers can manage their own carts
CREATE POLICY "Users can manage own carts" ON carts
  FOR ALL USING (
    customer_id IN (SELECT id FROM store_customers WHERE user_id = auth.uid())
  );

-- Store owners can view carts for analytics
CREATE POLICY "Store owners can view carts" ON carts
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
  );

-- === CART ITEMS ===
CREATE POLICY "Users can manage own cart items" ON cart_items
  FOR ALL USING (
    cart_id IN (
      SELECT id FROM carts WHERE customer_id IN (
        SELECT id FROM store_customers WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Store owners can view cart items" ON cart_items
  FOR SELECT USING (
    cart_id IN (
      SELECT id FROM carts WHERE store_id IN (
        SELECT id FROM stores WHERE owner_user_id = auth.uid()
      )
    )
  );

-- === DISCOUNTS ===
CREATE POLICY "Store owners can manage discounts" ON discounts
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Public can read active discounts" ON discounts
  FOR SELECT USING (is_active = true);

-- === PAYMENTS ===
CREATE POLICY "Store owners can view payments" ON payments
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Customers can view own payments" ON payments
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id IN (
        SELECT id FROM store_customers WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- STEP 3: Grant necessary permissions
-- ============================================================================

-- Allow authenticated users to access these tables (RLS will filter rows)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
