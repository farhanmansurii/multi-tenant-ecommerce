import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { logger } from "./logger";
import { serverError } from "./responses";
import { withTimeout } from "./timeout";

interface RequestWrapperOptions {
  timeout?: number;
  requireAuth?: boolean;
  logRequest?: boolean;
}

export function wrapApiHandler<T extends NextRequest>(
  handler: (request: T, context?: any) => Promise<NextResponse>,
  options: RequestWrapperOptions = {}
) {
  return async (request: T, context?: any): Promise<NextResponse> => {
    const requestId = randomUUID();
    const startTime = Date.now();

    // Add request ID to headers for tracing
    request.headers.set("X-Request-ID", requestId);

    try {
      if (options.logRequest) {
        logger.info("API request", {
          requestId,
          method: request.method,
          path: request.nextUrl.pathname,
          userAgent: request.headers.get("user-agent"),
        });
      }

      // Apply timeout if specified
      const response = options.timeout
        ? await withTimeout(handler(request, context), options.timeout)
        : await handler(request, context);

      const duration = Date.now() - startTime;

      if (options.logRequest) {
        logger.info("API response", {
          requestId,
          status: response.status,
          duration: `${duration}ms`,
        });
      }

      // Add request ID to response headers
      response.headers.set("X-Request-ID", requestId);
      response.headers.set("X-Response-Time", `${duration}ms`);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("API error", error, {
        requestId,
        method: request.method,
        path: request.nextUrl.pathname,
        duration: `${duration}ms`,
      });

      return serverError("An unexpected error occurred", {
        requestId,
        details: error,
      });
    }
  };
}
