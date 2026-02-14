## 1. Repository & Interface Foundation

- [x] 1.1 Define typed repository interfaces for stores, products, variants, orders, and customers that expose only the methods services require and implement the production versions using Drizzle queries documented in the specs
- [x] 1.2 Declare service interfaces (`IOrderService`, `IStoreService`, `ICheckoutService`) along with factory helpers that accept the new repositories/utility collaborators so routes can depend on interfaces instead of concrete classes

## 2. Middleware and Transaction Infrastructure

- [x] 2.1 Build the `composeMiddleware` helper and middleware stack (auth, rate-limit, validation, error capture) and wire it into a handful of representative dashboard routes to prove the pipeline short-circuits on failure
- [x] 2.2 Implement `transactionCoordinator.run`/`withTransaction` so callers receive a transactional client, and update the repository layer to accept this client for multi-step flows

## 3. Service Refactor & Payment Abstraction

- [ ] 3.1 Refactor `OrderService` to orchestrate `OrderValidator`, `DiscountCalculator`, and the new `OrderRepository`, relying on the interface to persist orders and never directly accessing the DB client as outlined in the orders-service spec
- [ ] 3.2 Refactor `StoreService` to delegate persistence to `StoreRepository` and membership management to `MembershipService`, and expose the new interface so routes can handle store settings and invites without duplicating queries
- [ ] 3.3 Refactor `CheckoutService` to use a `PaymentProcessor` interface and the transaction coordinator so failed charges roll back, and inject `businessRules` configuration instead of hard-coded limits
- [ ] 3.4 Refactor `ProductsService` to leverage `ProductRepository`/`VariantRepository` for reads/writes and keep metadata/enrichment helpers outside the persistence layer as described in the specs

## 4. Business Rules & Verification

- [ ] 4.1 Create the `businessRules` module that loads tax rates, item limits, discount thresholds, and cache TTLs from environment variables, validates them, and exposes typed helpers consumed by services
- [ ] 4.2 Add automated tests that mock the new repository/service interfaces to verify the middleware pipeline short-circuits appropriately and the transaction coordinator commits/rolls back flows
- [ ] 4.3 Document the new wiring in `src/lib/domains/services/index.ts` (or similar) so future refactors know how to assemble repositories, middleware, services, and business rules, and update a representative route to use this wiring plus the composed middleware
