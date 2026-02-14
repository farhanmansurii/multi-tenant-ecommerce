## Context

The multi-tenant ecommerce kiosk stack has been in active flux as new storefront experiences, API guards, and webhook integrations landed. During that churn we introduced scripts, ancillary `.md` artifacts, and Redux slices that were later superseded by more composable patterns. As a result the repo now contains "junk" paths that are rarely (if ever) referenced and a README that reflects older iterations, which makes it harder to explain the product story quickly. This change builds on the proposal by introducing a concrete technical approach for combing through the repo, safely pruning cruft, and documenting what remains plus the 30 resume-ready highlights requested.

## Goals / Non-Goals

**Goals:**

- Establish a reliable workflow for identifying unused directories/scripts across the storefront, API, and dashboard areas without regressing current features.
- Rewrite the root `README.md` so it mirrors the cleaned repo, clearly explains current modules/routing, and highlights developer onboarding steps + dev/test commands.
- Produce `resume-highlight-notes.md` containing 30 curated bullets (architecture takeaways, unique infra, automation, UX polish) grouped by theme for quick resume/interview reference.

**Non-Goals:**

- Deep refactors of the existing architecture (the cleanup is about pruning and documentation, not re-architecting).
- Removing any asset that still surfaces in entry points, API routes, or Next.js pages without further verification.

## Decisions

- **Detection strategy:** Combine static analysis (`tsc --noEmit`, `next lint`, `pnpm why` / `npm ls` equivalent) with targeted file-reference checks (`rg`, `git ls-files`, `ripgrep --files --glob "*.md"`) to list unreferenced TypeScript/JSX modules, scripts, and documentation. Alternative: rely on ad-hoc eyeballing only, but that carries too much risk of deleting live code. The chosen hybrid strategy balances automation with human review before deletion.
- **Pruning process:** For each candidate, ensure it is not imported by any live page, API route, or shared helper by searching for explicit imports and verifying with `next dev`/`pnpm lint` (or `npm run lint`) after staging. An additional safeguard is to keep deleted content in the cleanup branch until the checklist passes and to document the reasoning in `notes/CLEANUPS.md`. This avoids the alternative of removing files directly with git rm without tests and provides an auditable trail.
- **README refresh layout:** Start from the current README, keep the startup/installation steps, but reorganize into sections: Overview, Tech Stack, Project Structure (highlighting cleaned modules), Development Workflow, Testing/CI, Deployment notes, and Notable Patterns (linking to cleaned capabilities). The alternative of keeping the existing README would leave outdated references; reorganizing ensures the document matches the cleaned code.
- **Resume highlight doc structure:** Group the 30 points into categories such as Architecture & Data, API & Integrations, Dev Tooling, UI/UX, and Observability. Each entry should cite specific files or flows (e.g., "Medusa-style multi-tenant context handled at `src/lib/middleware/tenant.ts`"). The alternative (free-form list) might be harder to scan later, so structured categories keep the highlights useful.

## Risks / Trade-offs

- [Risk] Accidentally removing a file that is lazily loaded or referenced only via string-based imports → Mitigation: Keep review checklist, run `next build`, and re-run `routes` tests after each removal; if uncertain, move the file to a `deprecated/` folder first.
- [Risk] README rewrite loses existing valuable instructions → Mitigation: Archive the prior README in the change notes, keep key commands, and cross-check against doc fragments before removing them.
- [Risk] Highlights document drifts from reality if the repo evolves again → Mitigation: Timestamp the note and add a short "Verified as of" line plus pointers to relevant files so future updates know what was current.

## Migration Plan

1. Run tooling (`pnpm lint`, `pnpm test`, `next build`) before touching files so we know the baseline succeeds.
2. Build the list of unused assets with the detection strategy, then for each candidate confirm no imports exist, stage the removal, run `pnpm lint`/`tsc --noEmit`, and keep a backup log entry.
3. Update `README.md` in place to reflect the cleaned modules, verifying that the new sections cover setup, architecture, and run scripts; include links to the remaining features where helpful.
4. Draft `resume-highlight-notes.md` with 30 rigorously categorized bullet points; ensure each references specific files, directories, or behaviors touched by the cleanup.
5. After removing content and refreshing docs, run the suite of checks again (lint, build, unit/test scripts) to ensure no regressions.

## Open Questions

- Does "junk code" include entire directories (e.g., `src/lib/shopify`) that are currently deleted, or only files still present but unused? Clarification will help focus the pruning effort.
- Should the resume highlights document live in the repo root or under a `docs/` subdirectory for easier discovery?
