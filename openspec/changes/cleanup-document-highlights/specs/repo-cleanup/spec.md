## ADDED Requirements

### Requirement: Repository SHALL expose a repeatable cleanup detection workflow

The cleanup process SHALL combine static analysis (`tsc --noEmit`, `next lint`, `pnpm lint`) with targeted file-reference checks (`rg`, `git ls-files`, and pattern-based Search for `*.md`/scripts) to generate a list of candidate files or directories that lack inbound imports or references from `src/` entry points.

#### Scenario: Detect unused source modules

- **WHEN** the cleanup script runs the combined analysis against the current codebase
- **THEN** it reports every `.ts`/`.tsx`/`.js` file that is not imported by any page, API route, or shared helper and flags the corresponding path for human review

### Requirement: Repository SHALL enforce verification before deletions

Every candidate for removal SHALL be verified by re-running `pnpm lint` and `next build` (or `next lint --fix` followed by `next build`) after staging the deletion, ensuring no import errors emerge before the tidy-up is committed.

#### Scenario: Validation catches latent dependency

- **WHEN** a file slated for deletion is still required by a lazy-loaded route and the staged removal is validated with the lint/build sequence
- **THEN** the pipeline fails fast, restoration is recorded in `notes/CLEANUPS.md`, and the file remains until explicit confirmation that it can be removed
