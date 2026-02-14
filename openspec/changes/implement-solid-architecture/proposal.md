## Why

The codebase audit revealed multiple SOLID principle violations: routes handling multiple responsibilities, business logic mixed with HTTP concerns, tight coupling between services, and bloated interfaces. These architectural issues lead to code that's hard to test, modify, and maintain. Refactoring to follow SOLID principles will improve code organization, testability, and extensibility while reducing bugs.

## What Changes

- **Implement Repository Pattern**: Create data access layer separate from business logic
- **Extract business logic from routes**: Move domain logic to service layer
- **Create middleware pipeline**: Reusable auth, validation, rate-limit middleware
- **Apply Dependency Inversion**: Define interfaces for services, inject dependencies
- **Split bloated services**: Break down fat services (orders, stores) into focused modules
- **Make business rules configurable**: Extract hard-coded values (tax rates, limits) to config
- **Add transaction management**: Wrap multi-step operations in database transactions
- **Remove dead code**: Delete unused `request-wrapper.ts` and `BaseRepository`

## Capabilities

### New Capabilities

- `repository-pattern`: Data access abstraction layer
- `api-middleware-pipeline`: Composable middleware chain (auth, rate-limit, validate)
- `service-interfaces`: Dependency injection through interfaces
- `transaction-management`: Consistent DB transaction handling
- `configuration-management`: Environment-based business rules

### Modified Capabilities

- `orders-service`: Split into smaller, focused services
- `stores-service`: Separate repository, membership, and query logic
- `checkout-service`: Extract payment processor interface
- `products-service`: Add repository layer

## Impact

**New directories/files:**

- `src/lib/repositories/` - Repository implementations
  - `store-repository.ts`
  - `product-repository.ts`
  - `order-repository.ts`
  - `customer-repository.ts`
- `src/lib/api/middleware/` - Middleware chain
  - `auth.ts`
  - `rate-limit.ts`
  - `validate.ts`
  - `compose.ts`
- `src/lib/domains/**/interfaces.ts` - Service interfaces
- `src/lib/config/business-rules.ts` - Configurable rules

**Services to refactor:**

- `src/lib/domains/orders/service.ts` - Split into: OrderService, DiscountCalculator, OrderValidator
- `src/lib/domains/stores/helpers.ts` - Split into: StoreRepository, MembershipService
- `src/lib/domains/checkout/service.ts` - Extract PaymentProcessor interface

**Routes to refactor:**

- Move business logic to services
- Use middleware for cross-cutting concerns
- Apply dependency injection

**Files to remove:**

- `src/lib/api/request-wrapper.ts` (dead code)
- `src/lib/business/repositories/base-repository.ts` (unused)

**Dependencies:** No new dependencies (using existing patterns)

**Testing impact:** Significant - will require updating tests to use interfaces/mocks

**Breaking changes:** Service function signatures may change (dependency injection)
