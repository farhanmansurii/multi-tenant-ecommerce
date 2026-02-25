import { NextRequest } from "next/server";

import { ok, badRequest } from "@/lib/api/responses";
import { confirmCheckoutSchema, type ConfirmCheckoutInput } from "@/lib/domains/checkout";
import { createCheckoutService } from "@/lib/domains/services";
import {
  composeMiddleware,
  apiContextMiddleware,
  rateLimitMiddleware,
  validationMiddleware,
  withErrorCapture,
  type MiddlewareContext,
} from "@/lib/api/middleware/pipeline";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

const checkoutService = createCheckoutService();
const checkoutConfirmPipeline = composeMiddleware([
  apiContextMiddleware(),
  rateLimitMiddleware(),
  validationMiddleware(confirmCheckoutSchema),
]);

// POST /api/stores/[slug]/checkout/confirm - Confirm checkout and process payment
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withErrorCapture(async () => {
    const { slug } = await params;
    const context: MiddlewareContext = {
      request,
      slug,
      params: { slug },
      data: {},
    };

    const pipelineResult = await checkoutConfirmPipeline(context);
    if (pipelineResult instanceof Response) {
      return pipelineResult;
    }

    const apiContext = pipelineResult.data.apiContext as { storeId: string };
    const body = pipelineResult.data.validatedBody as ConfirmCheckoutInput;

    try {
      const result = await checkoutService.confirmCheckout(apiContext.storeId, body);

      if (result.success) {
        return ok({
          success: true,
          order: result.order,
          paymentStatus: result.paymentStatus,
          message: result.message,
        });
      }

      return ok(
        {
          success: false,
          order: result.order,
          paymentStatus: result.paymentStatus,
          message: result.message,
        },
        { status: 402 },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to confirm checkout";
      return badRequest(message);
    }
  });
}
