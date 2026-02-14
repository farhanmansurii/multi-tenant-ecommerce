## Why

The repository currently carries a number of stale helpers, documentation fragments, and overlapping assets that make it harder to understand the product and harder for me to explain the project on my resume. Cleaning up the noise, refreshing the README, and documenting standout learnings now will leave a leaner codebase and a stronger narrative to share with others.

## What Changes

- Audit the codebase to identify and remove junk code paths, unused feature files, and obsolete documentation (including stray `.md` files and scripts) that no longer support any active flow.
- Refresh the primary README so it clearly explains the current architecture, setup steps, and major capabilities once the cleanup is finished.
- Collect and document 30 interesting facts, architectural notes, or learnings from the repo so I can reference them directly when talking about the project in a resume or interview.

## Capabilities

### New Capabilities

- `repo-cleanup`: Safely detect and prune unused source files, routing artifacts, and deprecated `.md` documentation while validating that entry points and key API behaviors still build.
- `readme-refresh`: Rework the README to describe the refreshed project scope, highlight developer guidance, and point to the cleaned-up modules that remain relevant.
- `resume-highlight-notes`: Produce a concise document listing 30 noteworthy points about the codebase (architecture signals, tricky implementations, polish moments) for resume/interview use.

### Modified Capabilities

- _None._

## Impact

- touches the repository structure (unreferenced files, scripts, docs directories) and build tooling used to detect unused assets
- rewrites `README.md` in the repo root
- adds a new document containing the resume highlight notes so future readers can consume the curated insights
