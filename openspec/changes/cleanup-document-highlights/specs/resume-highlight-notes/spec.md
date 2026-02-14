## ADDED Requirements

### Requirement: Highlights document SHALL list 30 curated entries

The `resume-highlight-notes.md` document SHALL contain exactly 30 numbered or bullet entries that each highlight a different aspect of the repo (architecture, tooling, UX, integrations) so the author can draw resume talking points from them.

#### Scenario: Document meets target count

- **WHEN** the file is reviewed before merge
- **THEN** there are exactly 30 non-empty entries, and a linter-like check fails if the count deviates so the document is updated before completion

### Requirement: Each entry SHALL cite a concrete repo path or behavior

Every entry in the highlights document SHALL reference a specific file, module, directory, or observable behavior (e.g., `src/lib/middleware/tenant.ts` handles multi-tenancy, `src/app/api/stores/[slug]/orders/[orderId]/route.ts` applies middleware pipeline) so the notes remain verifiable.

#### Scenario: Entry references live code path

- **WHEN** a reviewer inspects a highlight entry
- **THEN** the referenced file or behavior still exists (or is intentionally deprecated with a note) and the entry links/backreferences the actual implementation to avoid vague statements
