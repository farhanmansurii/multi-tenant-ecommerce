## ADDED Requirements

### Requirement: Service interfaces limit consumer visibility

Each service interface (e.g., `OrderService`, `StoreService`, `CheckoutService`) SHALL declare only the operations needed by callers and be implemented by a concrete class that receives its dependencies via constructor arguments.

#### Scenario: Routes reference interfaces instead of classes

- **WHEN** the `/api/stores/[slug]/orders` route handles a request
- **THEN** it calls `orderService.listForStore(context)` where `orderService` is typed as the interface, allowing tests to inject a mock without new imports

#### Scenario: Interface additions do not break existing clients

- **WHEN** a new helper method is added to `OrderService` implementation but not exposed on the interface
- **THEN** consumers continue to compile because the interface controls the public surface, preventing accidental coupling to internal helpers
