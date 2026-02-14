## ADDED Requirements

### Requirement: Customer data access requires ownership verification

The system SHALL verify that the requesting user owns or has authorized access to customer data before returning it.

#### Scenario: Store owner accessing customer data

- **WHEN** a store owner requests customer data for their store
- **THEN** the system SHALL return the customer data

#### Scenario: Store admin accessing customer data

- **WHEN** a store admin or manager requests customer data for their store
- **THEN** the system SHALL return the customer data

#### Scenario: Unauthorized user accessing customer data

- **WHEN** a user requests customer data for a store they do not own or belong to
- **THEN** the system SHALL return HTTP 404 Not Found
- **AND** the system SHALL log an authorization failure event

#### Scenario: Customer accessing their own data

- **WHEN** a customer (authenticated via customer session) requests their own data
- **THEN** the system SHALL return the customer's own data only
- **AND** the system SHALL NOT return data of other customers

### Requirement: Order data access requires ownership verification

The system SHALL verify that the requesting user owns the order or has authorized access before returning order data.

#### Scenario: Store owner accessing store orders

- **WHEN** a store owner requests order data for their store
- **THEN** the system SHALL return the order data

#### Scenario: Unauthorized user accessing order

- **WHEN** a user requests order data for an order belonging to a different store
- **THEN** the system SHALL return HTTP 404 Not Found
- **AND** the system SHALL log an authorization failure event

#### Scenario: Customer accessing their own order

- **WHEN** a customer requests order data for an order they placed
- **AND** the customer is authenticated via customer session
- **THEN** the system SHALL return the order data

### Requirement: Resource authorization must be implemented as reusable middleware

The system SHALL provide reusable authorization middleware that can be applied to any resource endpoint.

#### Scenario: Applying authorization middleware to endpoint

- **WHEN** a new endpoint is created that requires resource authorization
- **THEN** the developer SHALL be able to apply a standard authorization middleware
- **AND** the middleware SHALL verify both authentication and ownership

#### Scenario: Middleware with custom resource types

- **WHEN** authorization middleware is applied
- **THEN** it SHALL support different resource types (customer, order, product, category)
- **AND** it SHALL use the appropriate ownership check for each resource type
