import type { NextRequest } from "next/server";

import { ok, notFound } from "@/lib/api/responses";
import {
  composeMiddleware,
  rateLimitMiddleware,
  storeMemberMiddleware,
  apiContextMiddleware,
  validationMiddleware,
  withErrorCapture,
  type ApiMiddleware,
} from "@/lib/api/middleware/pipeline";
import type { MiddlewareContext } from "@/lib/api/middleware/pipeline";
import type { ApiContext } from "@/lib/api/context";
import {
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  updateOrderStatusSchema,
} from "@/lib/domains/orders";
import type { z } from "zod";
import { CACHE_CONFIG } from "@/lib/api/cache-config";
import { revalidateOrderCache } from "@/lib/api/cache-revalidation";

type HandlerParams = { slug: string; orderId: string };
type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

const pipelineBase = (method: "GET" | "PATCH" | "DELETE", withValidation = false) => {
  const middlewares: ApiMiddleware[] = [
    apiContextMiddleware(),
    storeMemberMiddleware({
      resourceParam: "orderId",
      resourceType: "order",
      method,
    }),
    rateLimitMiddleware(),
  ];

  if (withValidation) {
    middlewares.push(validationMiddleware(updateOrderStatusSchema));
  }

  return composeMiddleware(middlewares);
};

async function buildPipelineContext(
  request: NextRequest,
  paramsPromise: Promise<HandlerParams>,
): Promise<MiddlewareContext> {
  const resolved = await paramsPromise;
  return {
    request,
    slug: resolved.slug,
    params: resolved,
    data: {},
  };
}

async function runPipeline(
  method: "GET" | "PATCH" | "DELETE",
  request: NextRequest,
  params: Promise<HandlerParams>,
  withValidation = false,
) {
  const context = await buildPipelineContext(request, params);
  const pipeline = pipelineBase(method, withValidation);
  return pipeline(context);
}

function extractApiContext(pipelineResult: MiddlewareContext): ApiContext {
  return pipelineResult.data.apiContext as ApiContext;
}

export async function GET(request: NextRequest, { params }: { params: Promise<HandlerParams> }) {
  return withErrorCapture(async () => {
    const pipelineResult = await runPipeline("GET", request, params);
    if (pipelineResult instanceof Response) {
      return pipelineResult;
    }

    const { orderId, slug } = pipelineResult.params;
    const apiContext = extractApiContext(pipelineResult);

    const order = await getOrderById(apiContext.storeId, orderId);
    if (!order) {
      return notFound("Order not found");
    }

    const response = ok(
      { order },
      {
        headers: {
          "Cache-Control": CACHE_CONFIG.ORDERS.cacheControl,
        },
      },
    );
    response.headers.set("Cache-Tag", CACHE_CONFIG.ORDERS.tags(slug).join(", "));
    return response;
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<HandlerParams> }) {
  return withErrorCapture(async () => {
    const pipelineResult = await runPipeline("PATCH", request, params, true);
    if (pipelineResult instanceof Response) {
      return pipelineResult;
    }

    const { orderId, slug } = pipelineResult.params;
    const apiContext = extractApiContext(pipelineResult);
    const validatedBody = pipelineResult.data.validatedBody as UpdateOrderStatusInput;

    const order = await updateOrderStatus(apiContext.storeId, orderId, validatedBody.status);
    if (!order) {
      return notFound("Order not found");
    }

    revalidateOrderCache(slug);
    return ok(
      { order },
      {
        headers: {
          "Cache-Control": CACHE_CONFIG.MUTATION.cacheControl,
        },
      },
    );
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<HandlerParams> }) {
  return withErrorCapture(async () => {
    const pipelineResult = await runPipeline("DELETE", request, params);
    if (pipelineResult instanceof Response) {
      return pipelineResult;
    }

    const { orderId, slug } = pipelineResult.params;
    const apiContext = extractApiContext(pipelineResult);

    const success = await cancelOrder(apiContext.storeId, orderId);
    if (!success) {
      return notFound("Order not found or cannot be cancelled");
    }

    revalidateOrderCache(slug);
    return ok(
      { success: true, message: "Order cancelled" },
      {
        headers: {
          "Cache-Control": CACHE_CONFIG.MUTATION.cacheControl,
        },
      },
    );
  });
}
