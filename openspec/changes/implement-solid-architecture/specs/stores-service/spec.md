## MODIFIED Requirements

### Requirement: Stores service splits repository and membership logic

`stores-service` SHALL delegate persistence to `StoreRepository` and membership concerns (roles, invites) to `MembershipService` so the service stays focused on coordinating store state rather than mixing query logic with membership flows.

#### Scenario: Store update uses repository only

- **WHEN** the dashboard updates store settings
- **THEN** `StoreRepository.updateSettings` performs the SQL work while `stores-service` simply validates and triggers the repository, proving the service no longer contains raw queries

#### Scenario: Membership changes go through membership service

- **WHEN** an admin adds a member
- **THEN** `MembershipService` verifies permissions and writes the join table while `stores-service` only orchestrates the call and handles audit logging, keeping responsibilities separated
