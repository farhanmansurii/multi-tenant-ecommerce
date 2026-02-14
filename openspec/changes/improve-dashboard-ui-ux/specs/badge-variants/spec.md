## ADDED Requirements

### Requirement: Badge supports semantic variants
The UI component `Badge` SHALL support semantic variants that map to meaning rather than raw colors.

Supported variants MUST include:
- `default`
- `secondary`
- `outline`
- `success`
- `warning`
- `destructive`
- `info`

The component MUST render with sufficient contrast in both light and dark themes using design tokens (not hard-coded Tailwind color values in consuming pages).

#### Scenario: Render a success badge
- **WHEN** a page renders `<Badge variant="success">Active</Badge>`
- **THEN** the badge appears visually distinct from `default` and communicates a positive/success state in both light and dark themes

#### Scenario: Render a destructive badge
- **WHEN** a page renders `<Badge variant="destructive">Cancelled</Badge>`
- **THEN** the badge communicates an error/destructive state and remains readable in both light and dark themes

### Requirement: Badge variant usage is consistent across dashboard
Dashboard feature code MUST use semantic badge variants (or equivalent semantic tokens) for status meaning, and MUST NOT encode meaning via raw Tailwind classes (e.g. `text-red-600`, `bg-green-50`) on badge-like UI.

#### Scenario: Order status badges use semantic variants
- **WHEN** the Orders list renders a "cancelled" status badge
- **THEN** the implementation uses a semantic badge variant (e.g. `destructive`) rather than hard-coded status color classes

#### Scenario: Category actions use semantic destructive styling
- **WHEN** a "Delete" action is shown in a dropdown menu
- **THEN** the destructive styling uses semantic tokens (e.g. `text-destructive`) rather than hard-coded red classes

