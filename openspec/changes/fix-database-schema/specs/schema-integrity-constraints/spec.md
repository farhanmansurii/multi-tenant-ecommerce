## ADDED Requirements

### Requirement: Enforce tenant-scoped foreign keys

The database schema SHALL declare foreign key constraints from every tenant-scoped table back to `stores.id` so that orphaned records cannot exist and store deletions cascade through associated data.

#### Scenario: Migration logs orphaned records before applying foreign keys

- **WHEN** the migration finds rows in `products`, `product_variants`, `categories`, or `tags` whose `store_id` does not match an existing store
- **THEN** the migration aborts, records the offending `store_id`/table counts, and surfaces the list for manual cleanup

#### Scenario: Deleting a store cascades tenant data

- **WHEN** a store row is deleted via the administrative UI or API
- **THEN** the database automatically cascades the deletion to `products`, `product_variants`, `categories`, and `tags` without the application issuing additional queries

### Requirement: Validate data before constraint enforcement

Before a migration sets foreign keys, the system SHALL verify integrity and refuse to run when violations exist so developers address data issues intentionally.

#### Scenario: Verification command detects orphan data

- **WHEN** the verification script is executed before deployment
- **THEN** it scans each tenant table for missing stores and returns a non-zero exit code if any orphans are found, preventing the deployment pipeline from continuing

#### Scenario: Clean data allows constraint addition

- **WHEN** the verification script reports zero violations
- **THEN** the migration proceeds to add the foreign key constraints and the subsequent schema validation confirms their presence
