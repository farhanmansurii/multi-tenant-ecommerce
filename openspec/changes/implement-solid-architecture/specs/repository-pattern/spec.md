## ADDED Requirements

### Requirement: Repository interfaces encapsulate Drizzle access

Each domain repository SHALL expose the minimal CRUD operations required by its consumers (e.g., `StoreRepository.getById`, `ProductRepository.listForStore`, `OrderRepository.persistWithItems`) and hide any Drizzle query builders so services cannot import `db` directly.

#### Scenario: Services consume repository methods

- **WHEN** `OrderService` needs to load an order with its items
- **THEN** it calls `orderRepository.findByIdWithItems(orderId)` without importing Drizzle or raw SQL, ensuring the query details live entirely in the repository implementation

#### Scenario: Repository implementations can be swapped in tests

- **WHEN** an integration test constructs `OrderRepository` using an in-memory stub
- **THEN** the stub satisfies the same interface as the production repository and the service code does not need to change, proving the abstraction works
