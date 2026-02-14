## Context

The comprehensive security audit identified 7 critical vulnerabilities in the multi-tenant e-commerce platform:

1. **Webhook bypass**: Shopify webhooks are accepted without verification when `SHOPIFY_WEBHOOK_SECRET` is not configured
2. **SQL injection**: Tenant context switching uses string concatenation in `src/lib/middleware/tenant.ts`
3. **Missing authorization**: Customer and order endpoints don't verify resource ownership
4. **No rate limiting**: Existing rate limiting code is not applied to any endpoints
5. **Unsanitized search**: Customer search allows SQL injection via `ilike` queries
6. **Unsafe type assertions**: Settings fields use `as any` casting

These vulnerabilities could allow:

- Unauthorized webhook processing by attackers
- Cross-tenant data access via SQL injection
- Data theft from other stores
- API abuse and cost overruns on AI features

## Goals / Non-Goals

**Goals:**

- Implement fail-closed webhook verification (reject if secret missing)
- Replace SQL string concatenation with parameterized queries for tenant context
- Add authorization middleware to verify resource ownership
- Apply rate limiting to AI, checkout, and general API endpoints
- Sanitize all user-provided search inputs
- Remove unsafe TypeScript type assertions

**Non-Goals:**

- Adding new authentication methods (existing auth stays)
- Changing the database schema (handled in separate change)
- Implementing new features (security fixes only)
- Refactoring business logic (minimal changes to fix security issues)

## Decisions

### Decision: Fail-closed vs fail-open for webhooks

**Choice:** Fail-closed (reject when secret not configured)
**Rationale:** While this may break webhook processing during initial setup, it's safer than silently accepting potentially malicious webhooks. Better to fail visibly than allow unauthorized access.
**Alternative:** Fail-open (accept when secret not configured) - Rejected due to security risk

### Decision: Parameterized queries vs ORM methods for tenant context

**Choice:** Use Drizzle's `sql` template literal for parameterized queries
**Rationale:** `sql\`SELECT set_config(...)\``provides SQL injection protection while maintaining the exact PostgreSQL function call needed for RLS
**Alternative:** Use Drizzle's query builder - Doesn't support`set_config` PostgreSQL function directly

### Decision: 404 vs 403 for unauthorized access

**Choice:** Return 404 Not Found for unauthorized resource access
**Rationale:** Prevents store enumeration attacks. Attackers can't distinguish between "resource doesn't exist" and "resource exists but you can't access it"
**Alternative:** Return 403 Forbidden - Rejected because it leaks resource existence

### Decision: In-memory vs Redis for rate limiting

**Choice:** In-memory rate limiting (using existing `src/lib/api/rate-limit.ts`)
**Rationale:** Simpler implementation, no new infrastructure needed. Sufficient for current scale.
**Alternative:** Redis-backed rate limiting - Consider for future if scaling to multiple servers

### Decision: Middleware vs inline checks for authorization

**Choice:** Create reusable middleware that wraps endpoints
**Rationale:** Consistent authorization logic, easier to test, DRY principle
**Alternative:** Inline checks in each route - Rejected due to duplication and maintenance burden

## Risks / Trade-offs

**[Risk]** Fail-closed webhooks may break existing integrations during deployment if secrets aren't configured
→ **Mitigation:** Add clear error logging and documentation. Verify secrets are configured before deployment.

**[Risk]** Parameterized query changes may have performance implications for high-throughput scenarios
→ **Mitigation:** The change is minimal (just query syntax), no additional round-trips. Monitor query performance after deployment.

**[Risk]** Rate limiting may impact legitimate high-volume users
→ **Mitigation:** Start with generous limits (10/min AI, 5/min checkout, 100/min general). Monitor and adjust based on usage patterns.

**[Risk]** Authorization middleware changes may break existing frontend code that relies on specific error responses
→ **Mitigation:** Frontend already handles 404s gracefully. Test all dashboard customer/order flows before deployment.

**[Risk]** Type assertion removals may expose type errors in dependent code
→ **Mitigation:** TypeScript compilation will catch these. Fix any exposed issues as part of this change.

## Migration Plan

**Pre-deployment:**

1. Verify `SHOPIFY_WEBHOOK_SECRET` is configured in all environments
2. Run security scan to identify any orphaned records that might fail FK constraints
3. Test webhook endpoints with valid and invalid signatures

**Deployment:**

1. Deploy webhook verification changes (can cause immediate breakage if secrets missing)
2. Deploy tenant isolation fixes (SQL injection fixes)
3. Deploy authorization middleware (may change error responses)
4. Enable rate limiting (should be transparent to users within limits)

**Rollback:**

- Each change is independent and can be rolled back separately
- Webhook changes are highest risk - have secret ready before deploying

## Open Questions

1. **Rate limit storage**: Should we persist rate limit counters across server restarts? (Current in-memory implementation resets on restart)
2. **Webhook retry logic**: Shopify webhooks retry on failure. Our 401 responses may cause unnecessary retries. Should we return 200 with error body instead?
3. **Customer session auth**: Do we have separate auth for customer-facing endpoints vs admin dashboard? The authorization middleware needs to handle both.
