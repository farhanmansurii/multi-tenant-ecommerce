## ADDED Requirements

### Requirement: Add composite indexes for order item lookups

The database SHALL include indexes on `order_items(order_id, product_id)` and `order_items(variant_id)` so that reporting and order detail queries avoid full table scans.

#### Scenario: Fetching order details uses the composite index

- **WHEN** a request retrieves an order along with its items
- **THEN** the database planner chooses the `(order_id, product_id)` index and the query completes with O(log n) behavior instead of scanning the entire table

#### Scenario: Variant lookups hit their index

- **WHEN** a analytics job filters `order_items` by `variant_id`
- **THEN** the execution plan shows the `variant_id` index in use and the latency remains stable as the dataset grows

### Requirement: Index category/tag slugs per store

The schema SHALL index `(store_id, slug)` on `categories` and `tags` so storefront lookups remain fast even with millions of records while supporting the unique constraint.

#### Scenario: Resolving a category by slug per store

- **WHEN** the storefront code fetches a category by `store_id` and `slug`
- **THEN** the query uses the `(store_id, slug)` index and returns within the service-level SLO regardless of store size
