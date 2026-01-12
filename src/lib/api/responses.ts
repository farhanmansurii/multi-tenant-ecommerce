import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { logger } from "./logger";

interface ApiErrorOptions {
  status?: number;
  code?: string;
  requestId?: string;
  details?: unknown;
}

function generateRequestId(): string {
  return randomUUID();
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data as unknown as Record<string, unknown>, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data as unknown as Record<string, unknown>, { status: 201, ...init });
}

export function badRequest(message = "Invalid request", options: ApiErrorOptions = {}) {
  const requestId = options.requestId || generateRequestId();
  logger.warn("Bad request", { requestId, message, code: options.code, details: options.details });

  return NextResponse.json(
    {
      error: message,
      code: options.code,
      requestId,
      ...(process.env.NODE_ENV === "development" && options.details ? { details: options.details } : {}),
    },
    {
      status: options.status ?? 400,
      headers: { "X-Request-ID": requestId },
    }
  );
}

export function unauthorized(message = "Unauthorized", options: ApiErrorOptions = {}) {
  const requestId = options.requestId || generateRequestId();
  logger.warn("Unauthorized request", { requestId, message, code: options.code });

  return NextResponse.json(
    { error: message, code: options.code, requestId },
    {
      status: options.status ?? 401,
      headers: { "X-Request-ID": requestId },
    }
  );
}

export function forbidden(message = "Forbidden", options: ApiErrorOptions = {}) {
  const requestId = options.requestId || generateRequestId();
  logger.warn("Forbidden request", { requestId, message, code: options.code });

  return NextResponse.json(
    { error: message, code: options.code, requestId },
    {
      status: options.status ?? 403,
      headers: { "X-Request-ID": requestId },
    }
  );
}

export function notFound(message = "Not found", options: ApiErrorOptions = {}) {
  const requestId = options.requestId || generateRequestId();

  return NextResponse.json(
    { error: message, code: options.code, requestId },
    {
      status: options.status ?? 404,
      headers: { "X-Request-ID": requestId },
    }
  );
}

export function conflict(message = "Conflict", options: ApiErrorOptions = {}) {
  const requestId = options.requestId || generateRequestId();
  logger.warn("Conflict", { requestId, message, code: options.code });

  return NextResponse.json(
    { error: message, code: options.code, requestId },
    {
      status: options.status ?? 409,
      headers: { "X-Request-ID": requestId },
    }
  );
}

export function serverError(message = "Internal server error", options: ApiErrorOptions = {}) {
  const requestId = options.requestId || generateRequestId();
  logger.error("Server error", options.details as Error, { requestId, message, code: options.code });

  return NextResponse.json(
    {
      error: message,
      code: options.code || "INTERNAL_SERVER_ERROR",
      requestId,
      ...(process.env.NODE_ENV === "development" && options.details ? { details: options.details } : {}),
    },
    {
      status: options.status ?? 500,
      headers: { "X-Request-ID": requestId },
    }
  );
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


