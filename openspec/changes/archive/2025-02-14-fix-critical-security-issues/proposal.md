## Why

The comprehensive audit revealed **7 critical security vulnerabilities** that could lead to unauthorized data access, SQL injection attacks, and webhook exploitation. These issues bypass tenant isolation, allowing attackers to access other stores' data or inject malicious SQL. Immediate fixes are required to protect customer data and maintain platform integrity.

## What Changes

- **Fix webhook security bypass**: Reject webhooks when secret not configured (fail-closed principle)
- **Fix SQL injection in tenant middleware**: Use parameterized queries instead of string concatenation
- **Add authorization to customer endpoints**: Verify ownership before returning customer data
- **Add authorization to order endpoints**: Verify user owns the order before access
- **Enable rate limiting**: Apply to AI endpoints (10/min), checkout (5/min), general API (100/min)
- **Sanitize search inputs**: Prevent SQL injection via customer search
- **Remove unsafe type assertions**: Add proper TypeScript validation

## Capabilities

### New Capabilities

- `webhook-verification`: Secure webhook validation with HMAC signature verification and fail-closed behavior
- `tenant-isolation`: SQL injection-safe tenant context switching using parameterized queries
- `resource-authorization`: Middleware for verifying user ownership of resources (customers, orders)
- `api-rate-limiting`: Configurable rate limiting per endpoint type with IP-based tracking

### Modified Capabilities

- None (these are all security fixes to existing capabilities)

## Impact

**Files to modify:**

- `src/app/api/webhooks/shopify/route.ts` - Add mandatory webhook verification
- `src/lib/middleware/tenant.ts` - Parameterize SQL queries
- `src/app/api/stores/[slug]/customers/[customerId]/route.ts` - Add ownership checks
- `src/app/api/stores/[slug]/orders/[orderId]/route.ts` - Add ownership checks
- `src/lib/api/rate-limit.ts` - Integrate into route handlers
- `src/lib/domains/customers/service.ts` - Sanitize search queries
- `src/app/api/stores/[slug]/route.ts` - Remove `as any` type assertions

**Dependencies:** No new dependencies required (using existing Drizzle, Next.js)

**Risk Level:** High - These are production security fixes requiring careful testing
