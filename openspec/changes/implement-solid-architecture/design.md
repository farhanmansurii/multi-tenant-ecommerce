## Context

The recent audit surfaced multiple SOLID violations: routes orchestrating business rules and persistence, bloated services that make the order/checkout flows difficult to test, and duplicated configuration sprinkled across layers. The codebase still relies on ad-hoc helpers such as `request-wrapper.ts` and `BaseRepository`, which are no longer active but show how we once tried to centralize cross-cutting concerns. Addressing these issues requires an architectural sweep across repositories, services, middleware, and configuration so the dashboard APIs behave predictably under load and new requirements can be added without fear of regressions.

## Goals / Non-Goals

**Goals:**

- Introduce repositories as clean persistence boundaries so services focus on rules, not SQL.
- Compose reusable middleware (auth, rate-limit, validation) to keep routes declarative.
- Apply dependency inversion via service interfaces and factories to make mocking trivial.
- Surface business rules (tax rates, thresholds, timeouts) through configurable modules.
- Enforce transaction management wherever operations span multiple tables or services.

**Non-Goals:**

- Rewriting the storefront; focus stays on dashboard and API layers.
- Introducing a heavyweight dependency injection container; use lightweight factories and manual wiring.
- Replacing every helper in one sweep; we can migrate incrementally by area.

## Decisions

1. **Repository Pattern for Persistence** → Each domain (products, stores, orders, customers) exposes an interface (e.g., `OrderRepository`, `StoreRepository`) that encapsulates Drizzle queries, pagination, and relation loading. Services receive these interfaces instead of raw DB APIs so we can swap implementations for tests or future backends. We considered keeping queries inside services but that would keep the same tight coupling and duplicate SQL logic.

2. **Middleware Pipeline Composition** → Introduce a `composeMiddleware` utility that threads contexts through `auth`, `rateLimit`, `validate`, and `errorCapture` handlers before hitting the route handler. This keeps routes focused on happy-path behavior and ensures cross-cutting concerns run in a predictable order. Alternative frameworks (e.g., Next middleware) were rejected because they lack the granularity we need per-route.

3. **Service Interfaces and Dependency Injection** → Define service interfaces (`IOrderService`, `IStoreService`, `ICheckoutService`) that list only the operations callers need. Concrete implementations are registered in `src/lib/domains/services/index.ts` and wired through manually passed factories (e.g., `createOrderService({ orderRepository, transactionCoordinator })`). This avoids global singletons while enabling migration of existing functions by gradually replacing direct imports with injected dependencies.

4. **Configuration-driven Business Rules** → Extract magic numbers (tax rate, max items, discount thresholds) into `src/lib/config/business-rules.ts`, which reads from `env` and exposes typed helpers. Services and middleware consume these values rather than hard-coding `0.18` or `5`. We considered keeping constants inline but the audit showed repeated values that drifted in tests.

5. **Transaction Management Strategy** → Wrap multi-step flows (order placement, checkout, membership updates) in a `withTransaction` helper that uses the shared Drizzle client. Each repository exposes a `runInTransaction` method and services call `transactionCoordinator.run(async (tx) => {...})`. The fallback was to rely on application-level compensating steps, but that leaves room for partial state.

6. **Service Splitting** → Break the fat `orders/service.ts` into focused modules: `OrderService` (high-level orchestration), `DiscountCalculator`, and `OrderValidator`. `stores/helpers.ts` will split into `StoreRepository` and `MembershipService`. `checkout/service.ts` introduces a `PaymentProcessor` interface so we can swap mock or real gateway logic without touching the service consumer.

## Risks / Trade-offs

- **Risk:** Refactoring services and repositories simultaneously may regress API contracts. → **Mitigation:** Keep existing route signatures by wrapping new services with thin adapters during the transition and add integration tests that mirror current behavior.
- **Risk:** Manual dependency wiring could become verbose. → **Mitigation:** Limit factories to one per domain, memoize them, and document the wiring pattern so future contributors follow it.
- **Trade-off:** Moving logic into services increases indirection but clarifies responsibilities. → **Mitigation:** Keep decision points well documented so developers can trace the flow.

## Migration Plan

1. Add `src/lib/repositories/*` implementations and their interfaces; use existing SQL helpers to avoid rewriting queries.
2. Refactor services (orders, stores, checkout, products) to consume repository interfaces and business-rule config instead of raw DB/context functions.
3. Implement the middleware pipeline and replace inline auth/rate-limit checks in a few representative routes before expanding outward.
4. Remove unused helpers (`request-wrapper.ts`, `BaseRepository`) once no code references them.
5. Update tests to mock service interfaces and validate transaction boundaries, ensuring the same API contracts remain intact.

## Open Questions

- Should we centralize the middleware pipeline further into a shared router helper, or keep per-route composition to preserve flexibility?
- Do we need to provide a simple dependency registration utility for future services, or is the current factory pattern sufficient?
- How will we phase rollout so clients can continue calling the existing APIs while the backend structure shifts? (Feature flags, gradual rollout, or big bang?)
