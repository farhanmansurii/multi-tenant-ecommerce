-- Row Level Security Policies for Multi-Tenant Ecommerce
-- This file contains all RLS policies to ensure tenant isolation

-- Enable RLS on all tenant-scoped tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Store policies
CREATE POLICY tenant_isolation_stores
  ON stores USING (id::text = current_setting('app.current_store_id', true));

-- Store members policies
CREATE POLICY tenant_isolation_store_members
  ON store_members USING (store_id::text = current_setting('app.current_store_id', true));

-- Product policies
CREATE POLICY tenant_isolation_products
  ON products USING (store_id::text = current_setting('app.current_store_id', true));

-- Product variants policies
CREATE POLICY tenant_isolation_product_variants
  ON product_variants USING (store_id::text = current_setting('app.current_store_id', true));

-- Category policies
CREATE POLICY tenant_isolation_categories
  ON categories USING (store_id::text = current_setting('app.current_store_id', true));

-- Tag policies
CREATE POLICY tenant_isolation_tags
  ON tags USING (store_id::text = current_setting('app.current_store_id', true));

-- Store customer policies
CREATE POLICY tenant_isolation_store_customers
  ON store_customers USING (store_id::text = current_setting('app.current_store_id', true));

-- Order policies
CREATE POLICY tenant_isolation_orders
  ON orders USING (store_id::text = current_setting('app.current_store_id', true));

-- Order items policies
CREATE POLICY tenant_isolation_order_items
  ON order_items USING (store_id::text = current_setting('app.current_store_id', true));

-- Payment policies
CREATE POLICY tenant_isolation_payments
  ON payments USING (store_id::text = current_setting('app.current_store_id', true));

-- Performance indexes for tenant isolation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_store_id_status
  ON products(store_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_store_id_created_at
  ON orders(store_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_store_customers_store_id_email
  ON store_customers(store_id, email);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_store_id_sku
  ON product_variants(store_id, sku);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_store_id
  ON order_items(store_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_store_id
  ON payments(store_id);
