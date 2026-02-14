## Why

The audit identified significant inconsistencies across the API layer: **3 different authentication patterns**, ad-hoc input validation, inconsistent error handling, and mixed response formats. This creates maintenance burden, increases bugs, and makes the API unpredictable for consumers. Standardization will reduce code duplication, improve reliability, and establish clear patterns for future development.

## What Changes

- **Consolidate auth patterns**: Standardize on `getApiContext` helper across all routes
- **Standardize error handling**: Use `logRouteError` wrapper consistently with request context
- **Create Zod validation schemas**: Define schemas for all route inputs (stores, products, categories, orders)
- **Unify response formats**: Consistent envelope structure `{ data, meta }` across all endpoints
- **Standardize caching headers**: Apply cache tags and revalidation consistently
- **Create API response utilities**: Reusable patterns for common responses
- **BREAKING**: Response format changes may affect frontend consumers

## Capabilities

### New Capabilities

- `api-context-helper`: Standardized authentication/authorization context provider
- `api-error-handling`: Consistent error logging and response formatting
- `api-validation`: Zod-based request validation middleware
- `api-response-utils`: Standardized response envelope and cache header utilities
- `api-caching`: Consistent cache tag generation and revalidation patterns

### Modified Capabilities

- `stores-api`: Response format standardization and input validation
- `products-api`: Response format standardization and input validation
- `orders-api`: Response format standardization and input validation
- `categories-api`: Response format standardization and input validation

## Impact

**Files to refactor:**

- `src/lib/api/context.ts` - Enhance with standardized options
- `src/lib/api/responses.ts` - Add consistent response utilities
- `src/lib/api/cache-revalidation.ts` - Standardize cache patterns
- `src/app/api/stores/**/route.ts` - Apply standard patterns
- `src/app/api/stores/[slug]/products/**/route.ts` - Apply standard patterns
- `src/app/api/stores/[slug]/orders/**/route.ts` - Apply standard patterns
- `src/app/api/stores/[slug]/categories/route.ts` - Apply standard patterns

**New files to create:**

- `src/lib/api/validation.ts` - Zod schema definitions
- `src/lib/schemas/store.ts` - Store-related Zod schemas
- `src/lib/schemas/product.ts` - Product-related Zod schemas
- `src/lib/schemas/order.ts` - Order-related Zod schemas

**Dependencies:** Zod (already in project)

**Testing required:** All API endpoints need regression testing
