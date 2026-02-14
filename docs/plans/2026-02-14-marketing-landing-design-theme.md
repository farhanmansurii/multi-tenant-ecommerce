# Marketing Landing Design Theme (Storefront + GSAP)

Date: 2026-02-14

This document captures the *existing* design language and animation patterns already present in the codebase, so we can rebuild the marketing landing at `"/"` using the storefront visual theme while keeping a GSAP-forward motion system.

## Sources (Current Code)

Marketing page (current `"/"`):
- Entry: `src/app/page.tsx` renders `src/app/home-page-client.tsx`
- Sections: `src/components/home-page/*`
  - Preloader: `src/components/home-page/preloader.tsx`
  - Navbar: `src/components/home-page/navbar.tsx`
  - Hero: `src/components/home-page/hero.tsx`
  - Features: `src/components/home-page/features.tsx`
  - Text reveal CTA: `src/components/home-page/text-reveal.tsx`
  - Footer: `src/components/home-page/footer.tsx`
  - Magnetic interaction: `src/components/home-page/magnetic-button.tsx`

Storefront (newer shadcn-based UI):
- Header: `src/components/features/storefront/shared/layout/navbar.tsx`
- Hero: `src/components/features/storefront/storefront-reusables/hero.tsx`
- Footer: `src/components/features/storefront/shared/layout/footer.tsx`
- Page wrapper: `src/components/features/storefront/shared/layout/page-wrapper.tsx`

Storefront (legacy GSAP-heavy “storefront-ui” package):
- Global tokens + typography rules: `src/components/storefront-ui/styles/globals.css`
- Layout modules: `src/components/storefront-ui/styles/home.css`
- GSAP modules: `src/components/storefront-ui/**` (e.g. `Copy`, `MarqueeBanner`, `PeelReveal`, `ZoomSection`)

Global theme tokens (shadcn/tailwind v4):
- CSS variables: `src/app/globals.css`

## Design Direction (What “Storefront Theme” Means Here)

The storefront theme (shadcn-based) reads as:
- High-contrast, editorial, “industrial retail”: heavy uppercase type, mono microcopy, hard borders, sharp dividers, grid layouts.
- Motion is restrained in the storefront UI itself (more UI-like), but we can layer in GSAP transitions for marketing moments.

The existing marketing landing reads as:
- Softer SaaS gradients, rounded cards, accent-colored highlights, “dashboard preview” visuals.
- Motion-first (preloader + scroll-triggered reveals + magnetic CTA).

Target for the rebuild:
- Visual theme: lean toward the storefront industrial/editorial direction.
- Motion system: keep GSAP/ScrollTrigger (optionally Lenis) for premium transitions.
- Copy system: rewrite all copy for the new feature set (copy-first page build).

## Typography System

### Storefront (shadcn-based)
Observed patterns:
- Header links: `text-xs font-mono uppercase tracking-widest`
- Brand wordmark: `text-xl md:text-2xl font-black uppercase tracking-tighter`
- Hero headline: `text-6xl ... xl:text-9xl font-black tracking-tighter uppercase leading-[0.8]`
- Supporting copy: lighter weight, muted foreground, often framed by a left border accent.

Practical rules to reuse:
- Headlines: very large, very tight tracking, uppercase, black weight.
- Microcopy: mono, uppercase, tracking wide.
- Body: modern sans, muted, moderate size; avoid paragraph walls.

### Marketing (current)
Uses `font-display` for titles and mixed-case/italic emphasis in places.

Decision for rebuild:
- Use the storefront type hierarchy (uppercase editorial) as default.
- Allow controlled italic emphasis (like the current marketing page) only for 1-2 “brand moments” per section.

## Color + Surfaces

### Global tokens
`src/app/globals.css` provides the neutral base via:
- `--background`, `--foreground`, `--muted`, `--border`, etc (oklch).

### Storefront surfaces (shadcn-based)
Observed patterns:
- Base: `bg-background text-foreground`
- Dividers: `border-b border-zinc-200 dark:border-zinc-800` (explicit zinc)
- Hero left panel tint: `bg-zinc-50/50 dark:bg-zinc-900/20`
- Footer: hard switch to `bg-black text-white`

Practical rules to reuse:
- Favor neutral backgrounds + visible borders instead of gradients.
- Use black/white inversions for section breaks (especially footer and one mid-page “statement” band).

## Layout + Spacing

### Container rules
Storefront uses `StoreFrontContainer` (`src/components/features/storefront/shared/layout/container.tsx`) to standardize max width and padding (the marketing page uses a `section-container` class concept).

Decision for rebuild:
- Standardize on `StoreFrontContainer` for marketing sections to match storefront spacing.
- Keep large vertical rhythm: sections typically `py-20` to `py-32`.

### Grid language
Storefront hero sets the language:
- Desktop: `grid-cols-12` split with a strong left editorial column and a right “info stack”.
- Borders define the grid (instead of shadows).

Marketing rebuild should follow:
- Section 1: editorial hero grid
- Section 2+: modular sections that keep borders/dividers as primary structure

## Component Motifs (Storefront)

### Header (fixed, industrial)
`src/components/features/storefront/shared/layout/navbar.tsx`:
- Fixed top bar
- Central logo lockup
- Mono uppercase navigation
- Border on scroll

Marketing rebuild should keep:
- Fixed header behavior (possibly with GSAP translateY hide/reveal)
- Central wordmark + left nav / right actions layout

### Hero (editorial product)
`src/components/features/storefront/storefront-reusables/hero.tsx`:
- Meta ticker bar
- Huge store name
- Left border for description
- Strong CTA button: square corners, uppercase, thick border
- Right rail: three stacked panels with a hard black “status” block

Marketing rebuild should translate this pattern to:
- Meta ticker: “New features”, “Multi-tenant”, “Ship faster”, etc (copy TBD)
- Massive headline with one “accent” treatment line
- Right rail for trust signals / platform stats / key claims

### Footer (black, newsletter, legal grid)
`src/components/features/storefront/shared/layout/footer.tsx`:
- Brand block, newsletter input, legal grid, minimal copyright.

Marketing rebuild should keep:
- Same footer structure but marketing-appropriate links (Docs, Changelog, Pricing, etc).

## Motion System (GSAP Patterns Already Used)

### Marketing page patterns (current)

1) Preloader timeline
- File: `src/components/home-page/preloader.tsx`
- Pattern: timeline with counter (`innerText`), progress bar scaleX, then page reveal by sliding layers up.

2) Hero entrance sequence (post-preloader)
- File: `src/components/home-page/hero.tsx`
- Pattern: `gsap.timeline({ delay: 2.2 })` and sequential `.from()` on class selectors.
- Easing: `power3.out` for entry, staggered groups.

3) Navbar scroll behavior (hide on scroll down)
- File: `src/components/home-page/navbar.tsx`
- Pattern: `ScrollTrigger.create({ onUpdate })` computing direction and toggling `yPercent`.

4) Section reveals
- File: `src/components/home-page/features.tsx`, `src/components/home-page/text-reveal.tsx`
- Pattern: `gsap.from(..., { scrollTrigger: { trigger, start: "top 70-75%" }})`

5) Magnetic CTA micro-interaction
- File: `src/components/home-page/magnetic-button.tsx`
- Pattern: `quickTo` on `x/y` with elastic ease; subtle inner text offset.

### Storefront-ui GSAP patterns (legacy package)
The `src/components/storefront-ui` folder includes:
- ScrollTrigger-driven image zoom (`ZoomSection`)
- SplitText-based copy reveals (`Copy`, `Menu`, `PeelReveal`)
- Scroll-bound marquee offsets (`MarqueeBanner`)

Decision for rebuild:
- Keep the simpler, more maintainable GSAP patterns (timeline entrances + ScrollTrigger reveals + nav hide/reveal).
- Only pull SplitText effects if they are needed for a specific hero/statement line (SplitText adds complexity and dependency surface).

## Implementation Constraints / Guardrails (For Rebuild)

- Marketing landing will live at `"/"` (Next app router): `src/app/page.tsx`.
- We will delete the current marketing landing implementation (`src/app/home-page-client.tsx` and `src/components/home-page/*`) only after the replacement is implemented and visually verified, to avoid a broken home route.
- Reuse storefront primitives where possible:
  - `StoreFrontContainer`
  - Button styles (square corners, uppercase, heavy tracking)
  - Header/footer structures
- Keep motion optional:
  - Respect `prefers-reduced-motion` (disable major scroll animations if enabled).
  - Avoid mandatory preloader if it slows first meaningful paint; if kept, keep it short and skip on repeat navigations.

## Next: Copy-First Page Outline (Placeholder)

We will draft copy after confirming the exact new feature set. The page skeleton will likely be:
1) Editorial hero (headline + rail claims + primary CTA)
2) Feature grid (3-6 features)
3) “How it works” steps (multi-tenant flow)
4) Trust / proof (metrics, testimonials, logos)
5) Final CTA band (black/white inversion)
6) Footer

