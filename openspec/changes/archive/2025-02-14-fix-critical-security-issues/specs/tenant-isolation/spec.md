## ADDED Requirements

### Requirement: Tenant context must use parameterized queries

The system SHALL use parameterized queries when setting tenant context in the database to prevent SQL injection attacks.

#### Scenario: Setting tenant context securely

- **WHEN** the system needs to set the current store context
- **THEN** the system SHALL use Drizzle's parameterized query syntax
- **AND** the store ID SHALL be passed as a query parameter, not concatenated into the SQL string

#### Scenario: Malicious store ID in tenant context

- **WHEN** a malicious store ID containing SQL injection attempts (e.g., `'; DROP TABLE users; --`) is provided
- **THEN** the parameterized query SHALL prevent the injection
- **AND** the system SHALL log the security violation attempt

### Requirement: Tenant context must be validated before application

The system SHALL validate that the store ID exists and the user has access before applying tenant context.

#### Scenario: Valid store with user access

- **WHEN** a request is made to access store data
- **AND** the store exists in the database
- **AND** the authenticated user is the owner or member of the store
- **THEN** the tenant context SHALL be set for that store
- **AND** the request SHALL proceed

#### Scenario: Non-existent store

- **WHEN** a request is made with a store slug that does not exist
- **THEN** the system SHALL return HTTP 404 Not Found
- **AND** the tenant context SHALL NOT be set

#### Scenario: User without store access

- **WHEN** a request is made to a store
- **AND** the authenticated user is neither the owner nor a member of that store
- **THEN** the system SHALL return HTTP 404 Not Found (not 403, to prevent store enumeration)
- **AND** the tenant context SHALL NOT be set
