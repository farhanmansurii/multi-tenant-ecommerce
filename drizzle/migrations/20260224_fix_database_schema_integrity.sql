-- fix-database-schema migration
-- This migration is guarded: it aborts when orphan data or duplicate slugs exist.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM products p
    LEFT JOIN stores s ON s.id = p.store_id
    WHERE s.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot migrate: orphan rows in products.store_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM product_variants pv
    LEFT JOIN stores s ON s.id = pv.store_id
    WHERE s.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot migrate: orphan rows in product_variants.store_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM categories c
    LEFT JOIN stores s ON s.id = c.store_id
    WHERE s.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot migrate: orphan rows in categories.store_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM tags t
    LEFT JOIN stores s ON s.id = t.store_id
    WHERE s.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot migrate: orphan rows in tags.store_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM categories c
    GROUP BY c.store_id, c.slug
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot migrate: duplicate (store_id, slug) rows in categories';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM tags t
    GROUP BY t.store_id, t.slug
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot migrate: duplicate (store_id, slug) rows in tags';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_store_id_fkey'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_store_id_fkey
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_store_id_fkey'
  ) THEN
    ALTER TABLE product_variants
      ADD CONSTRAINT product_variants_store_id_fkey
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_store_id_fkey'
  ) THEN
    ALTER TABLE categories
      ADD CONSTRAINT categories_store_id_fkey
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tags_store_id_fkey'
  ) THEN
    ALTER TABLE tags
      ADD CONSTRAINT tags_store_id_fkey
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_store_slug_unique'
  ) THEN
    ALTER TABLE categories
      ADD CONSTRAINT categories_store_slug_unique UNIQUE (store_id, slug);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tags_store_slug_unique'
  ) THEN
    ALTER TABLE tags
      ADD CONSTRAINT tags_store_slug_unique UNIQUE (store_id, slug);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS order_items_order_product_idx ON order_items (order_id, product_id);
CREATE INDEX IF NOT EXISTS order_items_variant_id_idx ON order_items (variant_id);

-- Verify order parity before dropping the legacy blob.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'store_customers'
      AND column_name = 'orders'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM store_customers sc
      LEFT JOIN (
        SELECT store_id, customer_id, COUNT(*)::int AS order_count
        FROM orders
        GROUP BY store_id, customer_id
      ) o ON o.store_id = sc.store_id AND o.customer_id = sc.id
      WHERE COALESCE(jsonb_array_length(sc.orders), 0) <> COALESCE(o.order_count, 0)
    ) THEN
      RAISE EXCEPTION 'Cannot migrate: store_customers.orders parity mismatch with orders table';
    END IF;
  END IF;
END
$$;

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
  SELECT order_id, SUM(qty)::int AS total_items
  FROM order_items
  GROUP BY order_id
) oi ON oi.order_id = o.id
GROUP BY sc.store_id, sc.id;
