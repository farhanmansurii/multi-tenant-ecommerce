# Multi-Tenant Ecommerce Architecture (Next.js 15 + Postgres + Drizzle + BetterAuth + shadcn/ui)

---

## 🎯 Core Principles

1. **Tenant Isolation**: Enforced via Postgres Row Level Security (RLS) keyed by `store_id`
2. **Scalability**: Shared DB, row-level tenancy, promotion path to schema/DB per tenant
3. **Security**: Session auth (BetterAuth), per-store roles, RLS guardrails
4. **Maintainability**: Drizzle schema-first, modular services, clean API boundaries
5. **Extensibility**: Stripe Connect for payments, modular shipping/tax, shadcn/ui for scalable UI

---

## 📊 Database Schema (Drizzle + Postgres)

### Global

```sql
users (
  id uuid pk, email text unique, name text, created_at timestamptz
)

stores (
  id uuid pk, owner_user_id fk users, slug text unique, status text, settings jsonb,
  created_at timestamptz, updated_at timestamptz
)

store_members (
  id uuid pk, store_id fk stores, user_id fk users,
  role text, permissions jsonb,
  created_at timestamptz,
  unique(store_id, user_id)
)
```

### Tenant-Scoped (all with `store_id` + RLS)

```sql
products (
  id uuid pk, store_id fk stores,
  name text, slug text, description text,
  status text, created_at timestamptz, updated_at timestamptz,
  unique(store_id, slug)
)

product_variants (
  id uuid pk, store_id fk stores,
  product_id fk products, sku text,
  price_cents int, currency text,
  inventory int, attributes jsonb,
  created_at timestamptz,
  unique(store_id, sku)
)

orders (
  id uuid pk, store_id fk stores, customer_id fk store_customers,
  order_number bigint, status text,
  amounts jsonb, currency text,
  payment_status text,
  shipping_address jsonb, billing_address jsonb,
  created_at timestamptz, updated_at timestamptz,
  unique(store_id, order_number)
)

order_items (
  id uuid pk, store_id fk stores,
  order_id fk orders, product_id fk products, variant_id fk product_variants,
  qty int, unit_price_cents int, total_price_cents int
)

store_customers (
  id uuid pk, store_id fk stores, user_id fk users nullable,
  email text, data jsonb,
  created_at timestamptz, updated_at timestamptz,
  unique(store_id, email)
)

payments (
  id uuid pk, store_id fk stores, order_id fk orders,
  amount_cents int, currency text,
  method text, status text, transaction_id text,
  gateway_response jsonb, created_at timestamptz,
  unique(store_id, transaction_id)
)
```

### Indexes

```sql
CREATE INDEX ON products(store_id, status);
CREATE INDEX ON orders(store_id, created_at DESC);
CREATE INDEX ON store_customers(store_id, email);
```

---

## 🔒 Tenant Isolation

### Postgres RLS

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_products
  ON products USING (store_id::text = current_setting('app.current_store_id'));
```

### Request Flow

1. Next.js middleware extracts subdomain (`storeSlug`)
2. Lookup store_id via cache or DB
3. Set Postgres variable:

   ```sql
   SELECT set_config('app.current_store_id', '<store_id>', true);
   ```
4. Drizzle queries automatically filtered by RLS

---

## 🚀 API Architecture (Next.js 15 App Router)

```
/app/api/
├── auth/                 # BetterAuth endpoints
├── storefront/[slug]/    # Public APIs
│   ├── products/         # Catalog
│   ├── cart/             # Cart ops
│   └── checkout/         # Checkout flow
└── admin/[slug]/         # Store admin APIs
    ├── products/         # CRUD
    ├── orders/           # Order mgmt
    └── settings/         # Store config
```

---

## 🛠️ Tech Integration

### Auth (BetterAuth)

* Postgres session store via Drizzle
* JWT cookies for API routes
* Role resolution via `store_members`

### ORM (Drizzle)

* Typed schemas for all tables
* Safe migrations under version control
* Query scoping handled by RLS

### UI (shadcn/ui)

* Storefront: product lists, product detail, cart, checkout
* Admin: dashboard, forms for product/order management
* Role-based UI conditionals

### Payments

* Stripe Connect: `stores.stripe_account_id`
* PaymentIntent with `transfer_data[destination] = store.stripe_account_id`
* Platform fees via `application_fee_amount`

---

## 🔄 Data Flow

```
Customer → Storefront → Cart → Checkout → Stripe PaymentIntent
  → Webhook → Order creation → Inventory decrement → Fulfillment
```

---

## 📈 Observability

* Logs: always include `store_id`, `user_id`, `request_id`
* Metrics: QPS, latency, errors per store
* Alerts: tenant error spikes

---

## 🧪 Testing

* Unit: permission checks
* Integration: store isolation (2 stores, cross-access denied)
* E2E: checkout flow, payment webhook
* Migration tests: rollback safety

---

## 🚀 Implementation Roadmap

**Phase 1: Foundation**

* Drizzle schema + migrations
* BetterAuth setup
* Tenant resolution + RLS
* Basic product CRUD

**Phase 2: Ecommerce Core**

* Storefront catalog
* Cart + checkout (mock payments)
* Orders + order items
* Stripe Connect integration

**Phase 3: Admin + UI**

* shadcn-based dashboard
* Order management
* Store settings

**Phase 4: Hardening**

* Caching with store-scoped keys
* Rate limiting per tenant
* Metrics + error tracking

---

## 💡 Benefits

* Strong tenant isolation by default
* Typed queries and migrations
* Modern UI with minimal boilerplate
* Payment architecture aligned with multi-tenant SaaS
* Straightforward scale path (RLS → schema-per-tenant → DB-per-tenant)
