## MODIFIED Requirements

### Requirement: Checkout service depends on PaymentProcessor interface

`checkout-service` SHALL accept a `PaymentProcessor` interface that returns standardized transaction results so the service remains agnostic to the actual gateway implementation (mock or Stripe) and only concerns itself with applying business rules and recording outcomes.

#### Scenario: Payment gateway failure rolls back checkout

- **WHEN** the selected `PaymentProcessor` rejects the charge
- **THEN** `checkout-service` surfaces the failure, logs it, and relies on `transactionCoordinator` to roll back the partially created order, proving the service logic stays independent of gateway specifics

#### Scenario: Switching gateway requires no service changes

- **WHEN** the team replaces the mock processor with Stripe
- **THEN** only the concrete implementation registered in the factory is swapped while `checkout-service` continues to compile against the same interface, showing the dependency inversion works
