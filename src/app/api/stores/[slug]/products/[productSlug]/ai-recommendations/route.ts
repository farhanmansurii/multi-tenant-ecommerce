import type { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/ecommerce/products";
import { aiService } from "@/lib/ai/openai";
import { notFound, serverError, ok, logRouteError } from "@/lib/api/responses";
import { rateLimit } from "@/lib/api/rate-limit";
import { getApiContext } from "@/lib/api/context";

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

    // Get the target product
    const targetProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, ctx.storeId), eq(products.slug, productSlug)))
      .limit(1);

    if (!targetProduct[0]) {
      return notFound("Product not found");
    }

    // Get all other active products in the store
    const storeProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categories: products.categories,
        tags: products.tags,
      })
      .from(products)
      .where(and(eq(products.storeId, ctx.storeId), eq(products.status, "active")));

    const otherProducts = storeProducts.filter((p) => p.id !== targetProduct[0].id);

    // Generate recommendations
    const recommendations = await aiService.generateProductRecommendations(
      {
        name: targetProduct[0].name,
        description: targetProduct[0].description,
        categories: targetProduct[0].categories || [],
        tags: targetProduct[0].tags || [],
      },
      otherProducts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        categories: p.categories || [],
        tags: p.tags || [],
      })),
    );

    // Get full product details for recommended products
    const recommendedProducts = await Promise.all(
      recommendations.map(async (rec) => {
        const product = await db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            description: products.description,
            price: products.price,
            images: products.images,
          })
          .from(products)
          .where(eq(products.id, rec.productId))
          .limit(1);

        return {
          ...rec,
          product: product[0],
        };
      }),
    );

    return ok({ recommendations: recommendedProducts });
  } catch (error) {
    await logRouteError("Error generating AI recommendations", error, params);
    return serverError();
  }
}
