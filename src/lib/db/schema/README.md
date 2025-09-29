# Database Schema

This directory contains the Drizzle ORM schema definitions for the multi-tenant ecommerce platform.

## Structure

```
schema/
├── auth/                    # Authentication & user management
│   ├── users.ts            # User accounts, sessions, verification
│   └── index.ts
├── core/                   # Core business entities
│   ├── stores.ts           # Store management & store members
│   ├── store-customers.ts  # Store-specific customer data
│   └── index.ts
├── ecommerce/              # Ecommerce-specific entities
│   ├── products.ts         # Product catalog
│   ├── product-variants.ts # Product variants & SKUs
│   ├── categories.ts       # Product categories
│   ├── orders.ts           # Orders & order items
│   ├── payments.ts         # Payment processing
│   └── index.ts
├── relations.ts            # All database relations
├── index.ts               # Main exports
└── README.md              # This file
```

## Key Features

### Multi-Tenant Architecture
- All tenant-scoped tables include `store_id` for isolation
- Row Level Security (RLS) policies enforce tenant boundaries
- Data is automatically filtered by `current_setting('app.current_store_id')`

### Core Entities

#### Stores (`core/stores.ts`)
- Store configuration and settings
- Store members with role-based permissions
- Owner relationship to users

#### Store Customers (`core/store-customers.ts`)
- Customer data specific to each store
- Supports both registered users and guest customers
- Wishlist, saved addresses, order history

### Ecommerce Entities

#### Products (`ecommerce/products.ts`)
- Product catalog with variants
- Inventory management
- SEO and media support

#### Orders (`ecommerce/orders.ts`)
- Order management with items
- Address and payment tracking
- Status management

#### Payments (`ecommerce/payments.ts`)
- Stripe Connect integration ready
- Multiple payment methods
- Transaction tracking

## Usage

```typescript
import { stores, products, orders } from "@/lib/db/schema";
import { db } from "@/lib/db";

// All queries are automatically tenant-scoped
const storeProducts = await db.select().from(products);
```

## Security

- RLS policies ensure complete tenant isolation
- All queries must set `app.current_store_id` context
- Foreign key constraints maintain data integrity
