import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shopifyConfigs } from "@/lib/db/schema/shopify";
import { stores } from "@/lib/db/schema/core/stores";
import { requireAuthOrNull } from "@/lib/session/helpers";
import { unauthorized, notFound, badRequest, serverError, ok } from "@/lib/api/responses";

export async function GET(
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

    // Get Shopify config
    const config = await db
      .select()
      .from(shopifyConfigs)
      .where(eq(shopifyConfigs.storeId, store[0].id))
      .limit(1);

    if (!config[0]) {
      return ok({ configured: false });
    }

    // Return config without sensitive data
    const { accessToken, webhookSecret, ...safeConfig } = config[0];
    return ok({
      configured: true,
      config: safeConfig,
    });
  } catch (error) {
    console.error("Error fetching Shopify config:", error);
    return serverError();
  }
}

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
    const {
      domain,
      accessToken,
      apiVersion = "2023-10",
      webhookSecret,
      settings = {
        syncProducts: true,
        syncInventory: true,
        syncOrders: false,
        autoPublish: false,
      },
    } = body;

    // Validate required fields
    if (!domain || !accessToken) {
      return badRequest("Domain and access token are required");
    }

    // Check if config already exists
    const existingConfig = await db
      .select()
      .from(shopifyConfigs)
      .where(eq(shopifyConfigs.storeId, store[0].id))
      .limit(1);

    if (existingConfig[0]) {
      // Update existing config
      await db
        .update(shopifyConfigs)
        .set({
          domain,
          accessToken,
          apiVersion,
          webhookSecret,
          settings,
          updatedAt: new Date(),
        })
        .where(eq(shopifyConfigs.id, existingConfig[0].id));

      return ok({ success: true, message: "Shopify configuration updated" });
    } else {
      // Create new config
      await db.insert(shopifyConfigs).values({
        id: crypto.randomUUID(),
        storeId: store[0].id,
        domain,
        accessToken,
        apiVersion,
        webhookSecret,
        enabled: false, // Disabled by default until tested
        settings,
      });

      return ok({ success: true, message: "Shopify configuration created" });
    }
  } catch (error) {
    console.error("Error saving Shopify config:", error);
    return serverError();
  }
}

export async function PATCH(
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
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return badRequest("Enabled must be a boolean");
    }

    await db
      .update(shopifyConfigs)
      .set({ enabled, updatedAt: new Date() })
      .where(eq(shopifyConfigs.storeId, store[0].id));

      return ok({ success: true, enabled });
  } catch (error) {
    console.error("Error updating Shopify config:", error);
    return serverError();
  }
}

export async function DELETE(
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

    await db
      .delete(shopifyConfigs)
      .where(eq(shopifyConfigs.storeId, store[0].id));

    return ok({ success: true, message: "Shopify configuration deleted" });
  } catch (error) {
    console.error("Error deleting Shopify config:", error);
    return serverError();
  }
}
