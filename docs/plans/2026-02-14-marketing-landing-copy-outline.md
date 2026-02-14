# Marketing Landing Copy Outline (Derived From Repo)

Date: 2026-02-14

Goal: rebuild the marketing landing at `"/"` with the storefront visual theme + GSAP motion, and update all copy to reflect what the product *actually* does in this repo today (and what is clearly “ready” vs “coming soon”).

## What The Product Is (Based On Code)

Positioning we can defend from the repo:
- Multi-tenant ecommerce platform where each store is isolated by Postgres Row Level Security (RLS). (`src/lib/db/policies.sql`, `src/lib/middleware/tenant.ts`)
- Tenant context resolves from subdomain or `/stores/{slug}` path routing. (`src/lib/middleware/tenant.ts`)
- Storefront + dashboard exist:
  - Storefront: product grid, product detail, cart, checkout, account, orders, wishlist. (`src/components/features/storefront/**`, `src/app/stores/[slug]/**`, `src/app/api/stores/[slug]/**`)
  - Dashboard: analytics, orders, customers, discounts, storefront draft editor (preview + publish). (`src/components/features/dashboard/**`)

## Feature Inventory (Ready Now)

### Platform / Architecture
- Multi-tenant isolation enforced with Postgres RLS policies per table. (`src/lib/db/policies.sql`)
- Tenant context is set server-side via `set_config('app.current_store_id', ...)`. (`src/lib/middleware/tenant.ts`)
- Slug extraction supports subdomain and path-based tenancy. (`src/lib/middleware/tenant.ts`)

### Storefront (Buyer Experience)
- Product browsing and filtering. (`src/components/features/storefront/views/home/storefront-view.tsx`, product grid components)
- Product detail pages. (`src/components/features/storefront/views/product/product-detail-view.tsx`)
- Cart (add/update/remove/clear). (`src/app/api/stores/[slug]/cart/**`, storefront cart views)
- Checkout session flow + confirmation (currently includes mock payment processing logic). (`src/lib/domains/checkout/service.ts`, `src/app/api/stores/[slug]/checkout/**`)
- Customer login flow and role separation (store owners vs storefront customers). (`docs/storefront-login-flow.md`)
- Wishlist (save items). (`src/lib/domains/customers/service.ts`, wishlist API routes)

### Merchant Dashboard (Operator Experience)
- Analytics dashboard and event tracking endpoints. (`src/components/features/dashboard/analytics-dashboard.tsx`, `src/app/api/stores/[slug]/analytics/**`)
- Orders management and order detail view. (`src/components/features/dashboard/admin-order-detail.tsx`, orders API)
- Customers listing and customer management endpoints. (`src/app/api/stores/[slug]/customers/**`)
- Discounts CRUD + activation toggles; order discount application. (`src/components/features/dashboard/admin-discounts-list.tsx`, `src/lib/domains/orders/service.ts`)
- Storefront draft editor with autosave, preview, and publish (staged content). (`src/components/features/dashboard/unified-editor/UnifiedStoreEditor.tsx`, `src/lib/domains/stores/storefront-draft-client.ts`)

### Store Settings That Matter In Copy
- Payment method configuration exists in store settings (not all processors are wired end-to-end). (`src/lib/domains/stores/types.ts`, `src/lib/domains/checkout/validation.ts`)
- Shipping toggles and policy pages exist per store. (`src/lib/domains/stores/types.ts`, storefront footer links)

## “Coming Soon” (Only If We’re Honest)

These appear as “ready” in types/notes, but not proven end-to-end in code paths we reviewed:
- “Stripe Connect integration ready” is stated in schema docs, but the checkout service currently uses mock processing. (`src/lib/db/schema/README.md`, `src/lib/domains/checkout/service.ts`)
- Additional payment methods exist in validation/types (`upi`, `bank_transfer`, `paypal`) but may not be active in UI/settings flows. (`src/lib/domains/checkout/validation.ts`, `src/lib/domains/payments/types.ts`)

We should market these as:
- “Stripe-ready architecture” / “pluggable payments” instead of “Stripe fully live”, unless you confirm it’s actually connected.

## Copy-First Page Structure (Recommended)

### 1) Hero (Editorial, Storefront Theme)
Eyebrow (mono, uppercase):
- “MULTI-TENANT COMMERCE, DONE RIGHT”

Headline (big, uppercase):
- “BUILD STORES FAST.”
- “ISOLATE DATA BY DEFAULT.”

Subhead (short, credible):
- “Kiosk is a multi-tenant commerce stack with a storefront, a dashboard, and Postgres RLS tenant isolation built-in.”

Primary CTA:
- “Create a store”

Secondary CTA:
- “View demo storefront”

Right rail “proof” blocks (3):
- “RLS Tenant Isolation”
- “Storefront Draft Preview + Publish”
- “Analytics, Orders, Customers, Discounts”

### 2) Why This Exists (Tenant Isolation Section)
Goal: explain the core differentiator in plain language.
Bullets:
- “Every row is scoped to a store.”
- “Tenant context set server-side.”
- “Subdomain or slug-based routing.”

### 3) Storefront Features (Buyer Experience)
Card grid (4-6 cards):
- Product grid + product detail
- Cart and checkout
- Customer account
- Wishlist
- Policies + support pages (terms/privacy/refunds/contact)

### 4) Dashboard Features (Merchant Experience)
Card grid (4-6 cards):
- Analytics dashboards + activity
- Orders and fulfillment status
- Customers management
- Discounts (fixed/percentage, limits, schedules)
- Draft storefront editor (autosave, preview, publish)

### 5) How It Works (3-Step)
1. Create store (`/dashboard` flow)
2. Customize storefront draft (preview while you edit)
3. Publish and sell (storefront routes under `/stores/{slug}`)

### 6) Architecture/Stack (Optional, Motion Section)
If we keep the current “tech stack” GSAP stack-cards section:
- Position it as “boring foundations, fast outcomes”
- Mention Next.js + Drizzle + Postgres RLS

### 7) Final CTA Band (Black/White Inversion)
Headline:
- “SHIP A NEW STORE TODAY.”
Body:
- “Draft, preview, publish. Then iterate with analytics.”
CTA:
- “Get started”

## Style Guide For Copy

- Voice: confident, technical but plain English, no hype words we can’t prove.
- Prefer “multi-tenant + RLS” over “enterprise-grade”.
- Avoid hard promises like “99.99% uptime” unless you have SLOs.
- When payments are mentioned, say “pluggable” or “Stripe-ready” until confirmed live.

