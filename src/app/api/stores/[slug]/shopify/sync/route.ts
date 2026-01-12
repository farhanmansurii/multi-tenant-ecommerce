import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema/core/stores";
import { requireAuthOrNull } from "@/lib/session/helpers";
import { unauthorized, notFound, badRequest, serverError, ok } from "@/lib/api/responses";
import { ShopifySyncService } from "@/lib/shopify/sync";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuthOrNull();
    if (!session) {
      return unauthorized();
    }

    const { slug } = await params;

    // Verify store ownership
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);

    if (!store[0] || store[0].ownerUserId !== session.user.id) {
      return notFound("Store not found or access denied");
    }

    const body = await request.json();
    const { type } = body; // "products", "inventory", or "all"

    const syncService = new ShopifySyncService(store[0].id);

    let result;
    switch (type) {
      case "products":
        result = await syncService.syncProducts();
        break;
      case "inventory":
        result = await syncService.syncInventory();
        break;
      case "all":
        const productsResult = await syncService.syncProducts();
        const inventoryResult = await syncService.syncInventory();
        result = {
          products: productsResult,
          inventory: inventoryResult,
        };
        break;
      default:
        return badRequest("Invalid sync type. Use 'products', 'inventory', or 'all'");
    }

    return ok({ success: true, result });
  } catch (error) {
    console.error("Error during Shopify sync:", error);
    return serverError((error as Error).message || "Internal server error");
  }
}
