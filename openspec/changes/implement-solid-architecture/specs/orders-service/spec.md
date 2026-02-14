## MODIFIED Requirements

### Requirement: Orders service orchestrates focused collaborators

`orders-service` SHALL delegate pricing, validation, and persistence to dedicated collaborators (`DiscountCalculator`, `OrderValidator`, and `OrderRepository`) so the orchestration layer only handles flow control and response shaping.

#### Scenario: Creating an order uses dedicated collaborators

- **WHEN** the API receives a create-order request
- **THEN** `OrderService.create(orderPayload)` runs `orderValidator.validate`, `discountCalculator.apply`, and `orderRepository.persistWithItems` sequentially and returns a consistent response even if one collaborator throws, proving the responsibilities have been separated

#### Scenario: Order status updates rely on dedicated repository

- **WHEN** a status transition occurs
- **THEN** `OrderService.updateStatus` calls `orderRepository.updateStatus` instead of touching `db` directly, ensuring the service never mixes validation, persistence, and status logic
