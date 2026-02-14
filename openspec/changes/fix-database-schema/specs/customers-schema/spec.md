## ADDED Requirements

### Requirement: Remove redundant customer orders JSON

The `store_customers.orders` JSON column SHALL be removed or relegated to a read-only, generated view so it never diverges from the canonical `orders` table.

#### Scenario: Dropping the JSON column

- **WHEN** the migration runs after validating parity between `store_customers.orders` and `orders`
- **THEN** the column is dropped and downstream queries only reference the normalized `orders` table

#### Scenario: Read-only view for legacy consumers

- **WHEN** legacy code still expects `store_customers.orders`
- **THEN** the migration provides a read-only SQL view that mirrors `orders`, preventing new writes but keeping back-compat tooling functional

### Requirement: Customer order types align with the schema

Customer-facing types SHALL represent `order_number` as a `bigint`/`number` and `status` as the schema enum so mismatches are caught at compile time.

#### Scenario: Fetching customer orders uses strict types

- **WHEN** the API serializes a customer order
- **THEN** the TypeScript type uses the normalized `OrderStatus` enum and a numeric `orderNumber`, and deserialization fails if the database returns unexpected values
