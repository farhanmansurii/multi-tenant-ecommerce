import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/ecommerce/products";
import { stores } from "@/lib/db/schema/core/stores";
import { requireAuthOrNull } from "@/lib/session/helpers";
import { aiService } from "@/lib/ai/openai";
import { unauthorized, notFound, badRequest, serverError, ok } from "@/lib/api/responses";
import { rateLimit } from "@/lib/api/rate-limit";

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
    const session = await requireAuthOrNull();
    if (!session) {
      return unauthorized();
    }

    const { slug, productSlug } = await params;

    // Verify store ownership
    const store = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);

    if (!store[0] || store[0].ownerUserId !== session.user.id) {
      return notFound("Store not found or access denied");
    }

    // Get the product
    const targetProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, store[0].id), eq(products.slug, productSlug)))
      .limit(1);

    if (!targetProduct[0]) {
      return notFound("Product not found");
    }

    const body = await request.json();
    const { targetAudience = "general consumers" } = body;

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
    console.error("Error generating AI copy suggestions:", error);
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
    const session = await requireAuthOrNull();
    if (!session) {
      return unauthorized();
    }

    const { slug, productSlug } = await params;

    // Verify store ownership
    const store = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);

    if (!store[0] || store[0].ownerUserId !== session.user.id) {
      return notFound("Store not found or access denied");
    }

    const body = await request.json();
    const { improvedDescription } = body;

    if (!improvedDescription) {
      return badRequest("Improved description is required");
    }

    // Update the product description
    await db
      .update(products)
      .set({
        description: improvedDescription,
        updatedAt: new Date(),
      })
      .where(and(eq(products.storeId, store[0].id), eq(products.slug, productSlug)));

    return ok({ success: true, message: "Product description updated" });
  } catch (error) {
    console.error("Error updating product description:", error);
    return serverError();
  }
}
