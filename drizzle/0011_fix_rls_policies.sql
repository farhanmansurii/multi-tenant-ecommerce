-- Fix remaining RLS policies
-- These had type mismatches or wrong enum values

-- Fix: products policy - use 'active' instead of 'published'
DROP POLICY IF EXISTS "Public can read published products" ON products;
CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (status = 'active');

-- Fix: Customers viewing orders - use TEXT comparison with cast
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (
    customer_id IN (SELECT id FROM store_customers WHERE user_id = auth.uid()::text)
  );

-- Fix: Customers viewing order items
DROP POLICY IF EXISTS "Customers can view own order items" ON order_items;
CREATE POLICY "Customers can view own order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id IN (
        SELECT id FROM store_customers WHERE user_id = auth.uid()::text
      )
    )
  );

-- Fix: Store owners viewing cart items
DROP POLICY IF EXISTS "Store owners can view cart items" ON cart_items;
CREATE POLICY "Store owners can view cart items" ON cart_items
  FOR SELECT USING (
    cart_id IN (
      SELECT id FROM carts WHERE store_id IN (
        SELECT id FROM stores WHERE owner_user_id = auth.uid()::text
      )
    )
  );

-- Fix: Customers viewing payments
DROP POLICY IF EXISTS "Customers can view own payments" ON payments;
CREATE POLICY "Customers can view own payments" ON payments
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id IN (
        SELECT id FROM store_customers WHERE user_id = auth.uid()::text
      )
    )
  );

-- Also fix the other policies that use auth.uid() to cast to text
DROP POLICY IF EXISTS "Owners can manage own stores" ON stores;
CREATE POLICY "Owners can manage own stores" ON stores
  FOR ALL USING (owner_user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Store members based on store ownership" ON store_members;
CREATE POLICY "Store members based on store ownership" ON store_members
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid()::text)
    OR user_id = auth.uid()::text
  );

DROP POLICY IF EXISTS "Store owners see own customers" ON store_customers;
CREATE POLICY "Store owners see own customers" ON store_customers
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid()::text)
    OR user_id = auth.uid()::text
  );

DROP POLICY IF EXISTS "Store owners can manage products" ON products;
CREATE POLICY "Store owners can manage products" ON products
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Store owners can manage variants" ON product_variants;
CREATE POLICY "Store owners can manage variants" ON product_variants
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Store owners can manage categories" ON categories;
CREATE POLICY "Store owners can manage categories" ON categories
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Store owners can manage orders" ON orders;
CREATE POLICY "Store owners can manage orders" ON orders
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Store owners can manage order items" ON order_items;
CREATE POLICY "Store owners can manage order items" ON order_items
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can manage own carts" ON carts;
CREATE POLICY "Users can manage own carts" ON carts
  FOR ALL USING (
    customer_id IN (SELECT id FROM store_customers WHERE user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Store owners can view carts" ON carts;
CREATE POLICY "Store owners can view carts" ON carts
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
CREATE POLICY "Users can manage own cart items" ON cart_items
  FOR ALL USING (
    cart_id IN (
      SELECT id FROM carts WHERE customer_id IN (
        SELECT id FROM store_customers WHERE user_id = auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS "Store owners can manage discounts" ON discounts;
CREATE POLICY "Store owners can manage discounts" ON discounts
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Store owners can view payments" ON payments;
CREATE POLICY "Store owners can view payments" ON payments
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_user_id = auth.uid()::text)
  );
