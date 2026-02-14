## ADDED Requirements

### Requirement: Capture the full ecommerce relation graph in Drizzle

Drizzle's `relations.ts` SHALL enumerate the relationships between stores, stores->products, products->variants, products->categories, orders->order_items, and customers->orders so generated query builders and type inference stay accurate.

#### Scenario: Generating a store query uses the relation map

- **WHEN** the application code imports `relations` and calls `relations.stores.products()`
- **THEN** the generated relation includes joins to `products`, `categories`, and `variants` with the correct foreign keys, and TypeScript infers the nested data

#### Scenario: Migration validation compares exported relation definitions

- **WHEN** the schema change runs a verification step
- **THEN** the verification reports the `relations.ts` file contains entries for every ecommerce table and that none of the referenced tables are missing foreign keys
