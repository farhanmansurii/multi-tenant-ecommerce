## ADDED Requirements

### Requirement: Order item indexes and type alignment

The `orders` domain SHALL reflect the schema addition of indexes on `order_items(order_id, product_id)` and `order_items(variant_id)` and the `orders.order_number` column being stored as `bigint` with matching enums for `status` and `payment_status`.

#### Scenario: Order detail API reads bigint order numbers

- **WHEN** the dashboard fetches an order by its number
- **THEN** the query uses the bigint representation and the TypeScript type for `orderNumber` is `number`, eliminating string-to-number casts

#### Scenario: Reporting queries benefit from indexes

- **WHEN** analytics code filters `order_items` by `order_id` or `variant_id`
- **THEN** the new indexes are used, and the query latency stays constant as data volume grows

### Requirement: Align status enums with schema

The domain types SHALL reuse the `order_status` and `order_payment_status` enums so the code cannot create unsupported states.

#### Scenario: Creating an order status update uses enum

- **WHEN** code attempts to set an order status
- **THEN** TypeScript restricts the value to the schema-defined enum and compiling fails if a non-specified status is used
