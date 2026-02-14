## Why

The database schema audit revealed **5 critical integrity issues**: missing foreign keys on tenant-scoped tables, no uniqueness constraints on store-level slugs, missing indexes causing sequential scans, and type mismatches between schema and domain types. These issues can lead to orphaned data, broken multi-tenancy, poor query performance, and runtime type errors.

## What Changes

- **Add missing foreign keys**: `products.storeId`, `product_variants.storeId`, `categories.storeId`, `tags.storeId` → `stores.id`
- **Enforce unique slugs per store**: Add `UNIQUE(store_id, slug)` on categories and tags
- **Add missing indexes**: `(order_id, product_id)` on order_items, `variant_id` index
- **Remove redundant JSON column**: Drop `store_customers.orders` or make read-only via trigger
- **Regenerate relations**: Update `drizzle/relations.ts` to include ecommerce tables
- **Fix type mismatches**: Align domain types with schema (bigint vs string, enum vs string)
- **BREAKING**: Foreign key additions may fail if orphaned data exists (requires data cleanup)

## Capabilities

### New Capabilities

- `schema-integrity-constraints`: Foreign keys and unique constraints for data integrity
- `schema-indexes`: Performance indexes for common query patterns
- `schema-relations`: Complete Drizzle relations for all tables

### Modified Capabilities

- `products-schema`: Add store foreign key constraint
- `categories-schema`: Add unique constraint on (store_id, slug)
- `orders-schema`: Add indexes and fix type definitions
- `customers-schema`: Remove redundant JSON orders column

## Impact

**Schema files to modify:**

- `src/lib/db/schema/ecommerce/products.ts` - Add FK to stores
- `src/lib/db/schema/ecommerce/product-variants.ts` - Add FK to stores
- `src/lib/db/schema/ecommerce/categories.ts` - Add FK and unique constraint
- `src/lib/db/schema/ecommerce/tags.ts` - Add FK and unique constraint
- `src/lib/db/schema/ecommerce/orders.ts` - Add indexes on order_items
- `src/lib/db/schema/core/store-customers.ts` - Remove or fix orders JSON
- `drizzle/relations.ts` - Regenerate with all tables

**Type files to fix:**

- `src/lib/domains/stores/types.ts` - Fix StoreData settings structure
- `src/lib/domains/products/types.ts` - Fix ProductVariant type
- `src/lib/domains/customers/types.ts` - Fix order number/status types
- `src/lib/domains/checkout/types.ts` - Expand payment status union

**Migrations required:**

- Migration to add FKs (with data cleanup for orphaned rows)
- Migration to add unique constraints
- Migration to add indexes
- Migration to drop redundant column

**Dependencies:** Drizzle ORM (already in use)

**Data cleanup required:** Must identify and fix orphaned records before adding FKs
