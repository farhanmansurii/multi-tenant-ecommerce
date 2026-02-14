-- Tenant-scoped foreign keys and indexes
ALTER TABLE products
  ADD CONSTRAINT products_store_id_fkey
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

ALTER TABLE product_variants
  ADD CONSTRAINT product_variants_store_id_fkey
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

ALTER TABLE categories
  ADD CONSTRAINT categories_store_id_fkey
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

ALTER TABLE tags
  ADD CONSTRAINT tags_store_id_fkey
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_store_id_fkey
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

ALTER TABLE categories
  ADD CONSTRAINT categories_store_slug_unique UNIQUE (store_id, slug);

ALTER TABLE tags
  ADD CONSTRAINT tags_store_slug_unique UNIQUE (store_id, slug);

CREATE INDEX IF NOT EXISTS order_items_order_product_idx ON order_items(order_id, product_id);
CREATE INDEX IF NOT EXISTS order_items_variant_id_idx ON order_items(variant_id);

ALTER TABLE store_customers DROP COLUMN IF EXISTS orders;

DROP VIEW IF EXISTS store_customer_orders;
CREATE VIEW store_customer_orders AS
SELECT
  sc.store_id,
  sc.id AS customer_id,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', o.id,
        'orderNumber', o.order_number::text,
        'status', o.status,
        'totalAmount', (o.amounts->>'total')::numeric,
        'currency', o.currency,
        'items', COALESCE(oi.total_items, 0),
        'placedAt', o.created_at
      ) ORDER BY o.created_at DESC
    ) FILTER (WHERE o.id IS NOT NULL),
    '[]'::jsonb
  ) AS orders
FROM store_customers sc
LEFT JOIN orders o ON o.store_id = sc.store_id AND o.customer_id = sc.id
LEFT JOIN (
  SELECT order_id, SUM(qty)::integer AS total_items
  FROM order_items
  GROUP BY order_id
) oi ON oi.order_id = o.id
GROUP BY sc.store_id, sc.id;
