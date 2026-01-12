import { NextRequest } from "next/server";
import { eq, desc, and, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { getApiContext } from "@/lib/api/context";
import { analyticsEvents } from "@/lib/db/schema/shopify";
import { products } from "@/lib/db/schema/ecommerce/products";
import { serverError, ok } from "@/lib/api/responses";
import { CACHE_CONFIG } from "@/lib/api/cache-config";

export const revalidate = 30;

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const ctx = await getApiContext(request, slug, { requireOwner: true });
    if (ctx instanceof Response) return ctx;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const recentEvents = await db
      .select({
        id: analyticsEvents.id,
        eventType: analyticsEvents.eventType,
        productId: analyticsEvents.productId,
        variantId: analyticsEvents.variantId,
        orderId: analyticsEvents.orderId,
        quantity: analyticsEvents.quantity,
        value: analyticsEvents.value,
        currency: analyticsEvents.currency,
        timestamp: analyticsEvents.timestamp,
        metadata: analyticsEvents.metadata,
        productName: products.name,
        productImage: products.images,
      })
      .from(analyticsEvents)
      .leftJoin(products, eq(analyticsEvents.productId, products.id))
      .where(
        and(
          eq(analyticsEvents.storeId, ctx.storeId),
          gte(analyticsEvents.timestamp, new Date(Date.now() - 24 * 60 * 60 * 1000)),
        ),
      )
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(limit);

    const activityItems = recentEvents.reduce((acc: any[], event) => {
      if (event.eventType === "view_product" && event.productId) {
        const existingIndex = acc.findIndex(
          (item) =>
            item.eventType === "view_product" &&
            item.productId === event.productId &&
            Date.now() - new Date(item.timestamp).getTime() < 5 * 60 * 1000, // Within 5 minutes
        );

        if (existingIndex >= 0) {
          acc[existingIndex].count += 1;
          acc[existingIndex].timestamp = event.timestamp; // Update to latest
          return acc;
        }
      }

      // Create new activity item
      const activityItem = {
        id: event.id,
        eventType: event.eventType,
        productId: event.productId,
        variantId: event.variantId,
        orderId: event.orderId,
        productName: event.productName,
        productImage: event.productImage?.[0]?.url,
        value: event.value,
        currency: event.currency,
        quantity: event.quantity,
        metadata: event.metadata,
        timestamp: event.timestamp,
        count: 1,
      };

      acc.push(activityItem);
      return acc;
    }, []);

    return ok(
      { activities: activityItems.slice(0, 20) },
      {
        headers: {
          'Cache-Control': CACHE_CONFIG.RECENT_ACTIVITY.cacheControl,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return serverError();
  }
}
