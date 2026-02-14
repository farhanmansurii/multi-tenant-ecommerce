## Context

The dashboard UI has grown organically and now mixes multiple layout idioms, ad-hoc Tailwind colors, and inconsistent component patterns (badges, empty states, forms, metrics, and navigation). This produces visual inconsistency, increases cognitive load for new users, and makes it harder to safely evolve the UI without regressions.

The codebase already has a component foundation (shadcn/ui primitives, dashboard layout shell, design tokens in `src/lib/design-tokens.ts`). The design goal is not “beautify”, but to enforce a small set of UI/UX rules and reuse them everywhere.

Constraints:

- Next.js App Router dashboard with nested layouts and route-level loading states.
- Existing shadcn/ui component set; avoid bespoke styling per screen.
- Must work well on mobile (sidebar offcanvas, clear primary actions).
- Accessibility should be default (keyboard navigation, focus, reduced motion).

## Goals / Non-Goals

**Goals:**

- Make the dashboard visually and behaviorally consistent across pages and loading states.
- Replace hard-coded semantic colors (e.g. red/green/yellow) with theme tokens (`destructive`, semantic variants).
- Establish a unified pattern for:
  - Metric cards
  - Empty states
  - Form layout + validation messaging
  - Table overflow affordances (scroll indicators)
  - Dashboard navigation on mobile
- Improve accessibility: skip link, focus management for dialogs, reduced motion support.
- Ensure all dashboard pages are “full width” while maintaining readable rhythm via spacing and sectioning (not max-width constraints).

**Non-Goals:**

- A full redesign of the storefront UI.
- Replacing Tailwind/shadcn with another UI framework.
- Rewriting all pages to a new router structure (incremental adoption only).
- Pixel-perfect “marketing” styling; prioritize a coherent system over decoration.

## Decisions

1. **Use semantic component variants instead of raw Tailwind colors**
   - Badge, alerts, destructive actions: use `variant` props and theme tokens.
   - Rationale: keeps light/dark behavior correct and removes per-page color drift.
   - Alternative: keep per-page Tailwind color classes. Rejected due to inconsistency and high maintenance cost.

2. **Standardize dashboard page structure around a single layout shell**
   - Dashboard pages should use the existing `DashboardLayout` + `PageHeader` + section `PageCard` pattern.
   - Remove “nested headings” inside forms/pages when the page header already communicates title/desc.
   - Rationale: predictable hierarchy and consistent spacing.
   - Alternative: allow each page to design its own header. Rejected due to repeated divergence.

3. **Full-width pages with “rhythm” enforced by section containers**
   - Keep header/footer full width.
   - Keep page content full width but enforce a consistent internal rhythm by using:
     - `PageContainer` padding rules
     - `PageCard` for major page sections
     - consistent grids for metric strips and filters
   - Rationale: avoids the “shrinked container” feeling while keeping content scannable.

4. **Metric cards: consistent baseline style, optional trend affordance**
   - Maintain a single `MetricCard` component API:
     - `label`, `value`, `icon`, optional `trend` (direction + percent/delta)
   - Rationale: metrics appear across stores, orders, customers, analytics; they should be visually identical.
   - Alternative: per-page metric cards. Rejected due to inconsistent hierarchy and spacing.

5. **Tables: wrap with a scroll container that shows overflow affordance**
   - Introduce a `TableScrollContainer` that:
     - detects horizontal overflow
     - renders subtle left/right gradient fades when scrollable
   - Rationale: prevents “hidden columns” on narrow screens without forcing responsive table rewrites.
   - Alternative: rewrite tables to cards on mobile only. Rejected as too expensive for all tables.

6. **Forms: one validation UX**
   - Standardize:
     - inline field errors using theme tokens
     - top-of-form error summary for multi-tab forms
     - consistent input density and labels
   - Rationale: forms are high-friction; inconsistency here is costly.

7. **Color picking: use a shared color picker component**
   - Use a single shared `ColorPicker` component and remove ad-hoc `type="color"` usage.
   - Rationale: consistent interaction, better precision than native input, matches theme.
   - Note: this introduces a small dependency (`react-colorful`) in exchange for consistent UX.

8. **Mobile navigation: one trigger, one behavior**
   - The sidebar should always be off-canvas on mobile, with a clear trigger in the navbar.
   - Rationale: reduces navigation confusion; aligns with the store-first flow.

## Risks / Trade-offs

- **Risk: Visual regressions across pages** → Mitigation: consolidate shared components and refactor pages to use them; avoid per-page overrides.
- **Risk: Added UI dependency (color picker)** → Mitigation: use a small, well-scoped library and wrap it behind `src/components/ui/color-picker.tsx`.
- **Risk: Mixed motion patterns (GSAP vs Framer Motion)** → Mitigation: keep metrics/forms lightweight and respect reduced motion; avoid introducing more animation systems.
- **Risk: Accessibility regressions in dialogs** → Mitigation: prefer Radix primitives (already used) and add explicit focus/aria checks in critical flows.

