## ADDED Requirements

### Requirement: README SHALL document the cleaned architecture and developer workflow

The root `README.md` SHALL be reorganized into sections covering Overview, Tech Stack, Project Structure, Development Workflow, Testing/CI, Deployment, and Notable Patterns so that each reflects the current state of the codebase post-cleanup.

#### Scenario: README aligns with remaining modules

- **WHEN** the README is reviewed after the cleanup removes unused assets
- **THEN** each section references only the modules, APIs, and scripts that still exist, and the Project Structure section lists the cleaned directories with short descriptions

### Requirement: README SHALL include clear setup and run instructions

The README SHALL list the required environment variables, installation command, dev server command, lint/build commands, and any specialty scripts (e.g., `scripts/build-storefront_scoped_css.mjs`) that remain, ensuring contributors can replicate the environment.

#### Scenario: Contributor follows README steps

- **WHEN** a developer follows the installation/dev commands enumerated in the README
- **THEN** they reach a runnable `next dev` session without relying on deprecated scripts or references to removed files
