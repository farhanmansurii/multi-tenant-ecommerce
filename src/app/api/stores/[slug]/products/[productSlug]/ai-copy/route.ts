import type { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/ecommerce/products";
import { aiService } from "@/lib/ai/openai";
import { notFound, serverError, ok, logRouteError } from "@/lib/api/responses";
import { rateLimit } from "@/lib/api/rate-limit";
import { getApiContext } from "@/lib/api/context";
import { parseJson } from "@/lib/api/validation";
import { aiCopyApplyBodySchema, aiCopySuggestionBodySchema } from "@/lib/schemas/product";
import { revalidateProductCache } from "@/lib/api/cache-revalidation";
import { CACHE_CONFIG } from "@/lib/api/cache-config";

// Rate limiter: 10 requests per minute per user for AI endpoints
const aiRateLimit = rateLimit({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 10, // 10 requests per minute
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productSlug: string }> },
) {
  // Apply rate limiting
  const rateLimitResponse = aiRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { slug, productSlug } = await params;
    const ctx = await getApiContext(request, slug, { requireOwner: true });
    if (ctx instanceof Response) return ctx;

    const targetProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, ctx.storeId), eq(products.slug, productSlug)))
      .limit(1);

    if (!targetProduct[0]) {
      return notFound("Product not found");
    }

    const body = await parseJson(request, aiCopySuggestionBodySchema);
    if (body instanceof Response) return body;
    const { targetAudience } = body;

    // Generate improved copy
    const suggestion = await aiService.improveProductCopy(
      {
        name: targetProduct[0].name,
        description: targetProduct[0].description,
        categories: targetProduct[0].categories || [],
        price: targetProduct[0].price,
      },
      targetAudience,
    );

    return ok({ suggestion });
  } catch (error) {
    await logRouteError("Error generating AI copy suggestions", error, params);
    return serverError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productSlug: string }> },
) {
  // Apply rate limiting
  const rateLimitResponse = aiRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { slug, productSlug } = await params;
    const ctx = await getApiContext(request, slug, { requireOwner: true });
    if (ctx instanceof Response) return ctx;

    const body = await parseJson(request, aiCopyApplyBodySchema);
    if (body instanceof Response) return body;
    const { improvedDescription } = body;

    // Update the product description
    await db
      .update(products)
      .set({
        description: improvedDescription,
        updatedAt: new Date(),
      })
      .where(and(eq(products.storeId, ctx.storeId), eq(products.slug, productSlug)));

    revalidateProductCache(slug, productSlug);
    return ok(
      { success: true, message: "Product description updated" },
      {
        headers: {
          "Cache-Control": CACHE_CONFIG.MUTATION.cacheControl,
        },
      },
    );
  } catch (error) {
    await logRouteError("Error updating product description", error, params);
    return serverError();
  }
}
