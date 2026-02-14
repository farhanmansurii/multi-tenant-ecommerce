import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodSchema } from "zod";

import { ApiContext, getApiContextOrNull } from "@/lib/api/context";
import { rateLimit, type RateLimitOptions } from "@/lib/api/rate-limit";
import { badRequest, notFound, serverError } from "@/lib/api/responses";
import { logAuthorizationFailure } from "@/lib/security/logger";
import { isStoreMember } from "./authorization";

export type RouteParams = Record<string, string>;

export interface MiddlewareContext {
  request: NextRequest;
  slug: string;
  params: RouteParams;
  data: Record<string, unknown>;
}

export type ApiMiddleware = (context: MiddlewareContext) => Promise<MiddlewareContext | Response>;

export function composeMiddleware(middlewares: ApiMiddleware[]): ApiMiddleware {
  return async (context) => {
    let ctx = context;
    for (const middleware of middlewares) {
      const output = await middleware(ctx);
      if (output instanceof Response) {
        return output;
      }
      ctx = output;
    }
    return ctx;
  };
}

export function apiContextMiddleware(): ApiMiddleware {
  return async (context) => {
    if (context.data.apiContext) {
      return context;
    }

    const apiContext = await getApiContextOrNull(context.request, context.slug);
    if (apiContext instanceof Response) {
      return apiContext;
    }

    if (!apiContext) {
      return notFound("Store not found");
    }

    return {
      ...context,
      data: {
        ...context.data,
        apiContext,
      },
    };
  };
}

interface StoreMemberMiddlewareOptions {
  resourceParam: string;
  resourceType: string;
  method: string;
  buildEndpoint?: (slug: string, params: RouteParams) => string;
}

export function storeMemberMiddleware(options: StoreMemberMiddlewareOptions): ApiMiddleware {
  return async (context) => {
    const apiContext = context.data.apiContext as ApiContext | undefined;
    const resourceId = context.params[options.resourceParam];

    if (!apiContext || !resourceId) {
      return notFound("Resource not found");
    }

    const hasAccess = await isStoreMember(apiContext.storeId, apiContext.userId);
    if (!hasAccess) {
      const endpoint =
        options.buildEndpoint?.(context.slug, context.params) ??
        `/api/stores/${context.slug}/${options.resourceType}s/${resourceId}`;

      logAuthorizationFailure(
        options.resourceType,
        resourceId,
        apiContext.userId,
        apiContext.storeId,
        endpoint,
        options.method,
      );

      return notFound("Resource not found");
    }

    return context;
  };
}

export function rateLimitMiddleware(options?: RateLimitOptions): ApiMiddleware {
  const limiter = rateLimit(options);
  return async (context) => {
    const response = limiter(context.request);
    if (response) {
      return response;
    }
    return context;
  };
}

export function validationMiddleware<T>(schema: ZodSchema<T>): ApiMiddleware {
  return async (context) => {
    try {
      const payload = await context.request.json();
      const parsed = await schema.safeParseAsync(payload);
      if (!parsed.success) {
        return badRequest("Invalid request shape", { details: parsed.error.format() });
      }

      return {
        ...context,
        data: {
          ...context.data,
          validatedBody: parsed.data,
        },
      };
    } catch (error) {
      return badRequest("Unable to parse request body", { details: error });
    }
  };
}

export async function withErrorCapture(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    console.error("API pipeline error:", error);
    return serverError("An unexpected error occurred", { details: error });
  }
}
