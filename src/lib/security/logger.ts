/**
 * Security event logging for audit trail and monitoring
 */

export type SecurityEventType =
  | "webhook_verification_failed"
  | "authorization_failed"
  | "rate_limit_exceeded"
  | "sql_injection_attempt"
  | "authentication_failed"
  | "suspicious_activity";

export interface SecurityEventContext {
  ip?: string;
  userId?: string;
  endpoint: string;
  method: string;
  details?: Record<string, unknown>;
}

export function logSecurityEvent(
  eventType: SecurityEventType,
  message: string,
  context: SecurityEventContext,
): void {
  const timestamp = new Date().toISOString();
  const event = {
    timestamp,
    type: eventType,
    message,
    ...context,
  };

  // Log to console for now - in production, send to security monitoring service
  console.warn(`[SECURITY] ${eventType}: ${message}`, JSON.stringify(event));

  // TODO: Send to external security monitoring service (e.g., Datadog, Splunk)
  // await sendToSecurityMonitoring(event);
}

export function logAuthorizationFailure(
  resourceType: string,
  resourceId: string,
  userId: string,
  storeId: string,
  endpoint: string,
  method: string,
): void {
  logSecurityEvent(
    "authorization_failed",
    `User ${userId} attempted unauthorized access to ${resourceType} ${resourceId} in store ${storeId}`,
    {
      endpoint,
      method,
      userId,
      details: { resourceType, resourceId, storeId },
    },
  );
}

export function logRateLimitViolation(
  userId: string | undefined,
  ip: string,
  endpoint: string,
  method: string,
  limit: number,
  window: string,
): void {
  logSecurityEvent("rate_limit_exceeded", `Rate limit exceeded for ${endpoint}`, {
    ip,
    userId,
    endpoint,
    method,
    details: { limit, window },
  });
}

export function logSqlInjectionAttempt(
  ip: string,
  endpoint: string,
  method: string,
  input: string,
): void {
  logSecurityEvent("sql_injection_attempt", `Potential SQL injection attempt detected`, {
    ip,
    endpoint,
    method,
    details: { input: input.substring(0, 100) }, // Truncate for safety
  });
}
