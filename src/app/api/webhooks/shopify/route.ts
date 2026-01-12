import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shopifyConfigs, shopifyProductMappings } from "@/lib/db/schema/shopify";
import { ShopifySyncService } from "@/lib/shopify/sync";
import crypto from "crypto";

async function verifyWebhook(request: NextRequest, webhookSecret?: string): Promise<boolean> {
  if (!webhookSecret) return true; // Skip verification if no secret configured

  const hmac = request.headers.get("X-Shopify-Hmac-SHA256");
  if (!hmac) return false;

  const body = await request.text();
  const computedHmac = crypto
    .createHmac("sha256", webhookSecret)
    .update(body, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(computedHmac));
}

export async function POST(request: NextRequest) {
  try {
    const topic = request.headers.get("X-Shopify-Topic");
    const shopDomain = request.headers.get("X-Shopify-Shop-Domain");

    if (!topic || !shopDomain) {
      return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
    }

    // Find the store config by domain
    const config = await db
      .select()
      .from(shopifyConfigs)
      .where(eq(shopifyConfigs.domain, shopDomain))
      .limit(1);

    if (!config[0] || !config[0].enabled) {
      return NextResponse.json({ error: "Shop not configured or disabled" }, { status: 404 });
    }

    // Verify webhook signature
    const isValid = await verifyWebhook(request, config[0].webhookSecret || undefined);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const body = await request.json();
    const syncService = new ShopifySyncService(config[0].storeId);

    switch (topic) {
      case "products/create":
      case "products/update":
        await handleProductWebhook(body.product!, syncService);
        break;

      case "products/delete":
        await handleProductDelete(body.product.id, config[0].storeId);
        break;

      case "inventory_levels/update":
        await handleInventoryUpdate(body.inventory_item, syncService);
        break;

      default:
        // Unknown topic, just acknowledge
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Shopify webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleProductWebhook(
  shopifyProduct: any,
  syncService: ShopifySyncService
) {
  try {
    // Use the webhook sync method for single product
    await syncService.syncSingleProductFromWebhook(shopifyProduct);
  } catch (error) {
    console.error("Error syncing product from webhook:", error);
    throw error;
  }
}

async function handleProductDelete(shopifyProductId: number, storeId: string) {
  try {
    // Find the mapping
    const mapping = await db
      .select()
      .from(shopifyProductMappings)
      .where(
        eq(shopifyProductMappings.shopifyProductId, shopifyProductId.toString())
      )
      .limit(1);

    if (mapping[0]) {
      // Delete the local product (this will cascade to variants)
      await db
        .delete(shopifyProductMappings)
        .where(eq(shopifyProductMappings.id, mapping[0].id));

      // Note: We don't actually delete the local product, just the mapping
      // The product remains in the local store for the merchant to manage
    }
  } catch (error) {
    console.error("Error handling product delete webhook:", error);
    throw error;
  }
}

async function handleInventoryUpdate(inventoryItem: any, syncService: ShopifySyncService) {
  try {
    // Use the existing inventory sync method
    await syncService.syncInventory();
  } catch (error) {
    console.error("Error syncing inventory from webhook:", error);
    throw error;
  }
}
