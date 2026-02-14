## ADDED Requirements

### Requirement: Transaction coordinator wraps multi-step flows

The `transactionCoordinator` SHALL provide a `run` method that accepts an async callback receiving a transactional database client and guarantees commit on success or rollback on error.

#### Scenario: Checkout completes atomically

- **WHEN** a checkout request writes the order, order items, and payment record inside `transactionCoordinator.run`
- **THEN** a failure writing the payment record rolls back the entire transaction so no partial order persists

#### Scenario: Service can reuse transaction client

- **WHEN** `OrderService` needs to update inventory and order status as part of a single operation
- **THEN** it passes the transactional client provided by `transactionCoordinator.run` to both repository calls, ensuring both updates participate in the same transaction
