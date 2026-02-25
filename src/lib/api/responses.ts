import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { logger } from "./logger";

/**
 * Canonical error taxonomy for route handlers.
 * Use one of these codes by default and override only for route-specific needs.
 */
interface ApiErrorOptions {
  status?: number;
  code?: string;
  requestId?: string;
  details?: unknown;
}

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_AUTHENTICATED"
  | "NOT_AUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

interface ApiMeta {
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Canonical success response envelope used across standardized API surfaces.
 * - data: required payload for successful responses
 * - meta: optional metadata (requestId, pagination, counters, etc.)
 */
interface SuccessEnvelope<T> {
  data: T;
  meta?: ApiMeta;
}

/**
 * Canonical error response envelope used across standardized API surfaces.
 * - error.code: stable machine-readable code from ApiErrorCode
 * - error.message: human-readable error summary
 * - error.details: optional structured debug/validation details
 * - meta.requestId: correlation id for tracing
 */
interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiMeta;
}

function generateRequestId(): string {
  return randomUUID();
}

export function ok<T>(data: T, init?: ResponseInit, meta?: ApiMeta) {
  const payload: SuccessEnvelope<T> = meta ? { data, meta } : { data };
  return NextResponse.json(payload, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit, meta?: ApiMeta) {
  const payload: SuccessEnvelope<T> = meta ? { data, meta } : { data };
  return NextResponse.json(payload, { status: 201, ...init });
}

export function noContent(init?: ResponseInit) {
  return new NextResponse(null, { status: 204, ...init });
}

function errorResponse(
  status: number,
  message: string,
  options: ApiErrorOptions,
  fallbackCode: ApiErrorCode,
): NextResponse<ErrorEnvelope> {
  const requestId = options.requestId || generateRequestId();
  const errorPayload: ErrorEnvelope = {
    error: {
      code: options.code || fallbackCode,
      message,
      ...(process.env.NODE_ENV === "development" && options.details
        ? { details: options.details }
        : {}),
    },
    meta: {
      requestId,
    },
  };

  return NextResponse.json(errorPayload, {
    status: options.status ?? status,
    headers: { "X-Request-ID": requestId },
  });
}

/**
 * Default helper-to-code mapping:
 * - badRequest      -> VALIDATION_ERROR
 * - unauthorized    -> NOT_AUTHENTICATED
 * - forbidden       -> NOT_AUTHORIZED
 * - notFound        -> NOT_FOUND
 * - conflict        -> CONFLICT
 * - serverError     -> INTERNAL_SERVER_ERROR
 */
export function badRequest(message = "Invalid request", options: ApiErrorOptions = {}) {
  logger.warn("Bad request", {
    requestId: options.requestId,
    message,
    code: options.code || "VALIDATION_ERROR",
    details: options.details,
  });
  return errorResponse(400, message, options, "VALIDATION_ERROR");
}

export function unauthorized(message = "Unauthorized", options: ApiErrorOptions = {}) {
  logger.warn("Unauthorized request", {
    requestId: options.requestId,
    message,
    code: options.code || "NOT_AUTHENTICATED",
  });
  return errorResponse(401, message, options, "NOT_AUTHENTICATED");
}

export function forbidden(message = "Forbidden", options: ApiErrorOptions = {}) {
  logger.warn("Forbidden request", {
    requestId: options.requestId,
    message,
    code: options.code || "NOT_AUTHORIZED",
  });
  return errorResponse(403, message, options, "NOT_AUTHORIZED");
}

export function notFound(message = "Not found", options: ApiErrorOptions = {}) {
  logger.warn("Resource not found", {
    requestId: options.requestId,
    message,
    code: options.code || "NOT_FOUND",
  });
  return errorResponse(404, message, options, "NOT_FOUND");
}

export function conflict(message = "Conflict", options: ApiErrorOptions = {}) {
  logger.warn("Conflict", {
    requestId: options.requestId,
    message,
    code: options.code || "CONFLICT",
  });
  return errorResponse(409, message, options, "CONFLICT");
}

export function serverError(message = "Internal server error", options: ApiErrorOptions = {}) {
  const requestId = options.requestId || generateRequestId();
  logger.error("Server error", options.details as Error, { requestId, message, code: options.code });

  return errorResponse(500, message, { ...options, requestId }, "INTERNAL_SERVER_ERROR");
}

/**
 * Safely extracts params from a Promise for error logging.
 * Handles cases where params might not be resolvable due to earlier errors.
 */
async function safeResolveParams<T extends Record<string, unknown>>(
  paramsPromise: Promise<T>
): Promise<T | null> {
  try {
    return await paramsPromise;
  } catch {
    return null;
  }
}

/**
 * Safely logs an error with route params context.
 * Attempts to resolve params for logging, but falls back gracefully if params cannot be resolved.
 *
 * @param message - Error message to log
 * @param error - The error that occurred
 * @param paramsPromise - Promise that resolves to route params
 * @param additionalContext - Additional context to include in error logs
 *
 * @example
 * ```ts
 * export async function GET(_request: NextRequest, { params }: RouteParams) {
 *   try {
 *     const { slug } = await params;
 *     // ... handler logic
 *   } catch (error) {
 *     logRouteError("Error fetching product", error, params);
 *     return serverError();
 *   }
 * }
 * ```
 */
export async function logRouteError<T extends Record<string, unknown>>(
  message: string,
  error: unknown,
  paramsPromise: Promise<T>,
  additionalContext?: Record<string, unknown>
): Promise<void> {
  const params = await safeResolveParams(paramsPromise);
  const context = {
    ...(params || {}),
    ...(additionalContext || {}),
  };

  logger.error(
    message,
    error,
    Object.keys(context).length > 0 ? context : undefined
  );
}

export async function withRouteError<T extends Record<string, unknown>>(
  operation: string,
  paramsPromise: Promise<T>,
  handler: () => Promise<Response>,
  additionalContext?: Record<string, unknown>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    await logRouteError(operation, error, paramsPromise, additionalContext);
    return serverError();
  }
}
