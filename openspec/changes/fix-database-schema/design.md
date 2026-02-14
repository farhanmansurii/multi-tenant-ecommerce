# Database Schema Fix - Technical Design

## Overview

This design document details the technical implementation for fixing critical database schema integrity issues in our multi-tenant e-commerce platform.

## Current State Analysis

### Issues Identified

1. **Missing Foreign Keys**: `products.storeId`, `product_variants.storeId`, `categories.storeId`, `tags.storeId` lack `REFERENCES(stores.id)` constraints
2. **No Composite Unique Constraints**: `categories.slug` and `tags.slug` are not unique per store
3. **Missing Indexes**: `order_items` lacks indexes on `(order_id, product_id)` and `variant_id`
4. **Redundant Data**: `store_customers.orders` JSON column duplicates the `orders` table
5. **Incomplete Relations**: `drizzle/relations.ts` only covers auth tables

## Technical Design

### 1. Add Missing Foreign Key Constraints

**Objective**: Ensure referential integrity across all tenant-scoped tables

**Affected Tables**:

- `products` → `stores(id)`
- `product_variants` → `stores(id)`
- `categories` → `stores(id)`
- `tags` → `stores(id)`

**Migration Strategy**:

```sql
-- Step 1: Validate existing data
SELECT * FROM products WHERE store_id NOT IN (SELECT id FROM stores);
-- Step 2: Add foreign key with ON DELETE CASCADE
ALTER TABLE products
ADD CONSTRAINT fk_products_store
FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
```

**Rollback Plan**:

```sql
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_store;
```

**Risk Assessment**: MEDIUM - Need to validate orphan records before migration

### 2. Enforce Per-Tenant Slug Uniqueness

**Objective**: Prevent slug collisions across different stores

**Affected Tables**:

- `categories` - Add unique constraint on `(store_id, slug)`
- `tags` - Add unique constraint on `(store_id, slug)`

**Migration Strategy**:

```sql
-- Check for existing duplicates
SELECT store_id, slug, COUNT(*)
FROM categories
GROUP BY store_id, slug
HAVING COUNT(*) > 1;

-- Add composite unique constraint
ALTER TABLE categories
ADD CONSTRAINT uq_categories_store_slug
UNIQUE (store_id, slug);
```

**Application Impact**: Update category/tag creation logic to handle unique constraint violations

### 3. Add Performance Indexes

**Objective**: Optimize query performance for order lookups

**New Indexes**:

```sql
-- For order item lookups by order
CREATE INDEX idx_order_items_order_product
ON order_items(order_id, product_id);

-- For variant-based queries
CREATE INDEX idx_order_items_variant
ON order_items(variant_id);

-- For category slug lookups per store
CREATE INDEX idx_categories_store_slug
ON categories(store_id, slug);
```

**Expected Performance Improvement**:

- Order detail queries: ~40% faster
- Product variant lookups: ~60% faster
- Category navigation: ~30% faster

### 4. Normalize Customer Orders Data

**Objective**: Remove redundant JSON column and rely on normalized schema

**Migration Plan**:

1. Verify data consistency between `store_customers.orders` and `orders` table
2. Create view for backward compatibility during transition
3. Remove column in final migration
4. Update application code to query `orders` table directly

**Verification Query**:

```sql
-- Check if JSON orders match actual orders
SELECT sc.id, sc.orders->>'count' as json_count,
       (SELECT COUNT(*) FROM orders o WHERE o.customer_id = sc.id) as actual_count
FROM store_customers sc
WHERE (sc.orders->>'count')::int != (SELECT COUNT(*) FROM orders o WHERE o.customer_id = sc.id);
```

### 5. Complete Drizzle Relations

**Objective**: Define complete relationship graph in `drizzle/relations.ts`

**Relations to Add**:

- `stores` → `products`, `categories`, `orders`, `customers`
- `products` → `product_variants`, `categories`
- `orders` → `order_items`, `payments`
- `customers` → `orders`

**Example**:

```typescript
export const storesRelations = relations(stores, ({ many }) => ({
  products: many(products),
  categories: many(categories),
  orders: many(orders),
  customers: many(storeCustomers),
}));
```

## Data Integrity Verification

### Pre-Migration Checks

Run these queries before each migration to identify data issues:

```sql
-- Check for orphaned products
SELECT COUNT(*) FROM products p
LEFT JOIN stores s ON p.store_id = s.id
WHERE s.id IS NULL;

-- Check for duplicate category slugs
SELECT store_id, slug, COUNT(*)
FROM categories
GROUP BY store_id, slug
HAVING COUNT(*) > 1;

-- Check for invalid order item references
SELECT COUNT(*) FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE oi.product_id IS NOT NULL AND p.id IS NULL;
```

### Post-Migration Validation

After each migration, verify:

1. All foreign keys are enforced
2. All unique constraints are active
3. Query performance meets expectations
4. Application functionality is preserved

## Migration Sequencing

**Phase 1 - Non-Breaking Changes** (Safe to deploy)

1. Add performance indexes (parallel execution)
2. Create Drizzle relations

**Phase 2 - Constraint Validation** (Deploy with monitoring)

1. Validate foreign key data integrity
2. Validate unique constraint data integrity

**Phase 3 - Breaking Changes** (Deploy with maintenance window)

1. Add foreign key constraints with CASCADE
2. Add unique constraints
3. Deprecate and remove redundant JSON column

## Rollback Procedures

Each migration includes a corresponding rollback script:

```sql
-- Rollback foreign key
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_store;

-- Rollback unique constraint
ALTER TABLE categories DROP CONSTRAINT IF EXISTS uq_categories_store_slug;

-- Rollback index
DROP INDEX IF EXISTS idx_order_items_order_product;
```

## Testing Strategy

### Unit Tests

- Foreign key constraint enforcement
- Unique constraint violations
- Index usage in query plans

### Integration Tests

- Store deletion cascades to related records
- Category slug uniqueness per store
- Order queries use new indexes

### Performance Tests

- Benchmark order detail queries before/after
- Benchmark category listing before/after
- Load test with 10k+ records

## Monitoring

### Key Metrics

- Migration execution time
- Query performance (p95, p99)
- Error rates on affected endpoints
- Database connection pool usage

### Alerts

- Migration failure
- Query performance regression > 20%
- Foreign key constraint violations
- Unique constraint violations

## Files Modified

### Schema Files

- `src/lib/db/schema/ecommerce/products.ts` - Add foreign key reference
- `src/lib/db/schema/ecommerce/product-variants.ts` - Add foreign key reference
- `src/lib/db/schema/ecommerce/categories.ts` - Add unique constraint
- `src/lib/db/schema/ecommerce/tags.ts` - Add unique constraint
- `src/lib/db/schema/ecommerce/orders.ts` - Add indexes
- `src/lib/db/schema/core/store-customers.ts` - Remove orders JSON column
- `drizzle/relations.ts` - Add all relations

### Migration Files

- `drizzle/migrations/XXXX_add_foreign_keys.sql`
- `drizzle/migrations/XXXX_add_unique_constraints.sql`
- `drizzle/migrations/XXXX_add_performance_indexes.sql`
- `drizzle/migrations/XXXX_remove_redundant_orders_column.sql`
- `drizzle/migrations/XXXX_add_drizzle_relations.sql`

### Service Files (Updates Required)

- `src/lib/domains/products/service.ts` - Handle FK errors
- `src/lib/domains/categories/service.ts` - Handle unique constraint violations
- `src/lib/domains/customers/service.ts` - Query orders table instead of JSON

## Dependencies

- PostgreSQL 14+ (for constraint features)
- Drizzle ORM with migration support
- Production database backup before migration
- Maintenance window for breaking changes

## Risks and Mitigations

| Risk                         | Likelihood | Impact | Mitigation                          |
| ---------------------------- | ---------- | ------ | ----------------------------------- |
| Data loss during FK addition | Low        | High   | Backup + validation queries         |
| Application downtime         | Medium     | High   | Phased rollout + maintenance window |
| Performance regression       | Low        | Medium | Benchmark testing + rollback plan   |
| Constraint violations        | Medium     | High   | Pre-migration validation            |

## Success Criteria

✅ All foreign key constraints enforced
✅ All unique constraints active per tenant
✅ Query performance improved or maintained
✅ No data loss
✅ Application functionality preserved
✅ Drizzle relations complete and functional
