## ADDED Requirements

### Requirement: Webhook verification must fail closed when secret is not configured

The system SHALL reject all webhook requests if the webhook secret is not configured in the environment. This prevents unauthorized webhook processing when security is not properly set up.

#### Scenario: Webhook received without secret configured

- **WHEN** a webhook request is received
- **AND** the `SHOPIFY_WEBHOOK_SECRET` environment variable is not set or is empty
- **THEN** the system SHALL return HTTP 401 Unauthorized
- **AND** the system SHALL log a security warning about missing webhook configuration

### Requirement: Webhook signature must be validated using HMAC-SHA256

The system SHALL validate webhook signatures using HMAC-SHA256 to ensure the webhook originated from the expected source and was not tampered with in transit.

#### Scenario: Valid webhook signature

- **WHEN** a webhook request is received with a valid HMAC-SHA256 signature in the `X-Shopify-Hmac-SHA256` header
- **AND** the signature matches the computed hash of the request body using the configured secret
- **THEN** the system SHALL process the webhook payload
- **AND** the system SHALL return HTTP 200 OK

#### Scenario: Invalid webhook signature

- **WHEN** a webhook request is received with an invalid or missing signature
- **THEN** the system SHALL return HTTP 401 Unauthorized
- **AND** the system SHALL log a security event with the request details
- **AND** the system SHALL NOT process the webhook payload

### Requirement: Webhook timestamp must be validated to prevent replay attacks

The system SHALL validate that webhook requests are recent to prevent replay attacks using captured webhook payloads.

#### Scenario: Webhook timestamp too old

- **WHEN** a webhook request is received with a timestamp more than 5 minutes in the past
- **THEN** the system SHALL return HTTP 401 Unauthorized
- **AND** the system SHALL log a potential replay attack attempt

#### Scenario: Webhook timestamp in the future

- **WHEN** a webhook request is received with a timestamp more than 1 minute in the future
- **THEN** the system SHALL return HTTP 401 Unauthorized
- **AND** the system SHALL log a timestamp anomaly
