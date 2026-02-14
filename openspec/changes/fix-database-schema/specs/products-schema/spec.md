## ADDED Requirements

### Requirement: products.store_id cascades to stores

The `products` table SHALL include a foreign key referencing `stores.id` with `ON DELETE CASCADE` so that products cannot exist without a store and they are removed when their store is deleted.

#### Scenario: Adding a product without a store fails

- **WHEN** an API call attempts to insert a product with a `store_id` that does not exist
- **THEN** the database rejects the insert with a foreign key violation error and the request responds with 400 guidance to pick a valid store

#### Scenario: Store removal cascades products

- **WHEN** a tenant is deleted via the dashboard
- **THEN** the database automatically deletes all associated products without needing additional cleanup code

### Requirement: Product types reflect schema changes

Client-side TypeScript definitions SHALL consume the Drizzle inferred product type so that any change in the schema automatically updates the domain type and prevents mismatches.

#### Scenario: Drizzle type inference updates after schema change

- **WHEN** a developer updates `products` schema columns
- **THEN** rebuilding TypeScript yields updated interfaces used by domain services, ensuring compilation fails if the code still relies on removed fields
