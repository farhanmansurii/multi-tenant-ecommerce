## 1. Cleanup discovery & verification

- [ ] 1.1 Run the combined detection workflow: `tsc --noEmit`, `pnpm lint`, and `next lint`, then cross-match with `rg`, `git ls-files`, and targeted `*.md`/script grabs to enumerate files/directories without inbound imports or references.
- [ ] 1.2 Review the candidate list, capture rationale (including any string-based references) in `notes/CLEANUPS.md`, and confirm each file is not required by pages/API routes before removing it.
- [ ] 1.3 Stage the approved removals, rerun `pnpm lint` and `next build` (or `next lint --fix` then `next build`) to catch latent dependencies, and revert/log any failure before finalizing.

## 2. README refresh

- [ ] 2.1 Reorganize `README.md` into Overview, Tech Stack, Project Structure (listing cleaned directories), Development Workflow, Testing/CI, Deployment, and Notable Patterns sections that describe the remaining code paths.
- [ ] 2.2 Update the README installation/dev/run instructions with the current env vars, `pnpm install`/`pnpm dev`, lint/build commands, and any specialty scripts still in play so new contributors can replicate the setup.

## 3. Resume highlight notes

- [ ] 3.1 Draft `resume-highlight-notes.md` with 30 entries organized by theme (Architecture, Tooling, UI/UX, Integrations, Observability) so each bullet references a concrete file or behavior.
- [ ] 3.2 Validate the highlight entries by confirming each referenced path still exists or noting intentional deprecations, ensuring the document is verifiable before committing.

## 4. Final verification & documentation

- [ ] 4.1 After pruning and docs updates, rerun `pnpm lint`, `next build`, and any key tests to ensure nothing broke during cleanup.
- [ ] 4.2 Summarize the cleanup actions, listing removed assets and updated docs, in `notes/CLEANUPS.md` or a similar log for future traceability.
