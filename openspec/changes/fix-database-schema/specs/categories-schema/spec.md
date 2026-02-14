## ADDED Requirements

### Requirement: category slugs unique per store

The `categories` table SHALL enforce `UNIQUE(store_id, slug)` so that each store can reuse slug names safely while preventing cross-tenant conflicts.

#### Scenario: Creating duplicate slug in same store fails

- **WHEN** a user tries to add a second category with the same slug under the same store
- **THEN** the insert fails with a unique constraint error and the API surfaces a clear message saying the slug already exists for that store

#### Scenario: Different stores can share slugs

- **WHEN** two distinct stores create categories that happen to have the same slug
- **THEN** both inserts succeed because the constraint is scoped by `store_id`

### Requirement: Categories inherit foreign key behavior

Categories SHALL include a foreign key to `stores.id` that cascades on delete and restricts orphan creation.

#### Scenario: Store deletion removes categories

- **WHEN** the store record is deleted
- **THEN** every category linked to that store is also deleted without manual cleanup
