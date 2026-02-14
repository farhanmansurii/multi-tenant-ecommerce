## ADDED Requirements

### Requirement: Business rules derive from typed config

The `businessRules` module SHALL load tax rates, item limits, discount thresholds, and cache TTLs from environment variables (with sane defaults) and expose functions/values that services consume instead of hard-coded literals.

#### Scenario: Tax rate update happens without code changes

- **WHEN** the finance team updates the `TAX_RATE` environment variable
- **THEN** after restarting the service, the `businessRules.taxRate` value reflects the new rate and every service that references that helper uses the updated number automatically

#### Scenario: Invalid config fails fast

- **WHEN** `businessRules` is initialized with a non-numeric `TAX_RATE`
- **THEN** the application fails during startup with a clear error describing the invalid value, preventing deployment with misconfigured business rules
