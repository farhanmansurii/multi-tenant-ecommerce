## 1. Schema cleanup and migration prep

- [ ] 1.1 Create a verification script that scans `products`, `product_variants`, `categories`, `tags`, and `order_items` for orphan `store_id` or missing parent records and exits non-zero when any violations exist
- [ ] 1.2 Write and test the migration that adds foreign keys (products.store_id, product_variants.store_id, categories.store_id, tags.store_id) with `ON DELETE CASCADE` and ensures the script from 1.1 blocks execution until the data is clean
- [ ] 1.3 Add the unique constraint on `(store_id, slug)` for categories and tags plus the `(order_id, product_id)` and `variant_id` indexes for `order_items`, verifying they deploy without locking beyond the maintenance window
- [ ] 1.4 Drop the `store_customers.orders` JSON column (and provide a read-only view/permanent read façade if legacy consumers still rely on it) only after confirming parity with the normal `orders` rows

## 2. Relations and type alignment

- [ ] 2.1 Regenerate `drizzle/relations.ts` so it covers every ecommerce table (`stores`, `products`, `product_variants`, `categories`, `orders`, `order_items`, `payments`, `store_customers`, `tags`) and reflects the new foreign keys
- [ ] 2.2 Update domain type definitions (`StoreData`, `ProductVariant`, `CustomerOrderSummary`, `CheckoutResult.paymentStatus`) to derive from the new schema (use `$inferSelect` when possible) and ensure every enum/currency field matches the DB representation
- [ ] 2.3 Adjust services or serializers that previously relied on the `store_customers.orders` blob so they now read from the canonical `orders` table and the TypeScript compiler verifies the change

## 3. Testing, docs, and deployment

- [ ] 3.1 Add automated tests (unit or integration) that attempt to insert orphaned child records and expect the database to reject them, and confirm the new indexes are present via query plan checks
- [ ] 3.2 Document the rollback steps, verification script usage, and data-cleanup checklist for running the migrations safely in staging/production
- [ ] 3.3 Update the change log or release notes to mention the schema breaking change so downstream teams know to rerun migrations before deploying
