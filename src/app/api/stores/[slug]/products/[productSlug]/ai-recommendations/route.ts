import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/ecommerce/products";
import { stores } from "@/lib/db/schema/core/stores";
import { aiService } from "@/lib/ai/openai";
import { requireAuthOrNull } from "@/lib/session/helpers";
import { unauthorized, notFound, serverError, ok } from "@/lib/api/responses";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productSlug: string }> }
) {
  try {
    const session = await requireAuthOrNull();
    if (!session) {
      return unauthorized();
    }

    const { slug, productSlug } = await params;

    // Verify store ownership
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);

    if (!store[0] || store[0].ownerUserId !== session.user.id) {
      return notFound("Store not found or access denied");
    }

    // Get the target product
    const targetProduct = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.storeId, store[0].id),
          eq(products.slug, productSlug)
        )
      )
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
      .where(
        and(
          eq(products.storeId, store[0].id),
          eq(products.status, "active")
        )
      );

    const otherProducts = storeProducts.filter(p => p.id !== targetProduct[0].id);

    // Generate recommendations
    const recommendations = await aiService.generateProductRecommendations(
      {
        name: targetProduct[0].name,
        description: targetProduct[0].description,
        categories: targetProduct[0].categories || [],
        tags: targetProduct[0].tags || [],
      },
      otherProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        categories: p.categories || [],
        tags: p.tags || [],
      }))
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
      })
    );

    return ok({ recommendations: recommendedProducts });
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    return serverError();
  }
}
