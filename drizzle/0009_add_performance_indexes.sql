-- Add performance indexes for critical queries
-- This migration adds indexes to improve query performance across the dashboard

-- Stores table indexes
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);

-- Products table indexes (most critical for storefront performance)
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_store_status ON products(store_id, status);
CREATE INDEX IF NOT EXISTS idx_products_store_slug ON products(store_id, slug);
CREATE INDEX IF NOT EXISTS idx_products_store_created ON products(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(store_id, featured) WHERE featured = true;

-- Orders table indexes (critical for analytics and dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_created ON orders(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_status ON orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_store_payment ON orders(store_id, payment_status);

-- Store customers table indexes
CREATE INDEX IF NOT EXISTS idx_store_customers_store ON store_customers(store_id);
CREATE INDEX IF NOT EXISTS idx_store_customers_user ON store_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_store_customers_email ON store_customers(store_id, email);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_store ON categories(store_id);
CREATE INDEX IF NOT EXISTS idx_categories_store_active ON categories(store_id, is_active);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Cart table indexes
CREATE INDEX IF NOT EXISTS idx_carts_store ON carts(store_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_customer ON carts(customer_id);

-- Cart items table indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_store ON payments(store_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
