## ADDED Requirements

### Requirement: AI endpoints must be rate limited

The system SHALL apply rate limiting to AI-related endpoints to prevent abuse and manage API costs.

#### Scenario: AI endpoint within rate limit

- **WHEN** a user makes a request to an AI endpoint (e.g., `/api/stores/[slug]/products/[productSlug]/ai-copy`)
- **AND** the user has made fewer than 10 requests in the last 60 seconds
- **THEN** the request SHALL be processed
- **AND** the remaining rate limit SHALL be returned in response headers

#### Scenario: AI endpoint exceeds rate limit

- **WHEN** a user makes a request to an AI endpoint
- **AND** the user has already made 10 or more requests in the last 60 seconds
- **THEN** the system SHALL return HTTP 429 Too Many Requests
- **AND** the response SHALL include a `Retry-After` header indicating when the user can retry
- **AND** the system SHALL log the rate limit violation

### Requirement: Checkout endpoints must be rate limited

The system SHALL apply rate limiting to checkout endpoints to prevent abuse and ensure fair resource allocation.

#### Scenario: Checkout within rate limit

- **WHEN** a user makes a checkout-related request (e.g., verify discount, confirm checkout)
- **AND** the user has made fewer than 5 requests in the last 60 seconds
- **THEN** the request SHALL be processed

#### Scenario: Checkout exceeds rate limit

- **WHEN** a user exceeds 5 checkout requests in 60 seconds
- **THEN** the system SHALL return HTTP 429 Too Many Requests
- **AND** the response SHALL include a `Retry-After` header

### Requirement: General API endpoints must be rate limited

The system SHALL apply a general rate limit to all API endpoints to prevent abuse.

#### Scenario: General API within rate limit

- **WHEN** a user makes any API request
- **AND** the user has made fewer than 100 requests in the last 60 seconds
- **THEN** the request SHALL be processed

#### Scenario: General API exceeds rate limit

- **WHEN** a user exceeds 100 API requests in 60 seconds
- **THEN** the system SHALL return HTTP 429 Too Many Requests
- **AND** the response SHALL include a `Retry-After` header

### Requirement: Rate limiting must track by IP address and user

The system SHALL track rate limits by both IP address and authenticated user to prevent circumvention.

#### Scenario: Rate limit per IP address

- **WHEN** multiple users share the same IP address (e.g., behind NAT)
- **THEN** each IP address SHALL have its own rate limit counter

#### Scenario: Rate limit per authenticated user

- **WHEN** a user is authenticated
- **THEN** the rate limit SHALL be tracked by user ID
- **AND** the IP-based rate limit SHALL also apply

#### Scenario: Unauthenticated requests

- **WHEN** a request is made without authentication
- **THEN** only the IP-based rate limit SHALL apply
