import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, ProductImage } from "@/lib/db/schema/ecommerce/products";
import { productVariants } from "@/lib/db/schema/ecommerce/product-variants";
import { shopifyConfigs, shopifyProductMappings, shopifyVariantMappings } from "@/lib/db/schema/shopify";
import { ShopifyClient, ShopifyConfig, ShopifyProduct, ShopifyVariant } from "./client";

export class ShopifySyncService {
  constructor(private storeId: string) {}

  async getShopifyConfig(): Promise<ShopifyConfig> {
    const config = await db
      .select()
      .from(shopifyConfigs)
      .where(eq(shopifyConfigs.storeId, this.storeId))
      .limit(1);

    if (!config[0] || !config[0].enabled) {
      throw new Error("Shopify integration not configured or disabled");
    }

    // Transform database result to match ShopifyConfig interface
    return {
      ...config[0],
      webhookSecret: config[0].webhookSecret || undefined,
      settings: config[0].settings || {
        syncProducts: true,
        syncInventory: true,
        syncOrders: false,
        autoPublish: false,
      },
      lastSyncAt: config[0].lastSyncAt || undefined,
    };
  }

  async syncSingleProductFromWebhook(shopifyProduct: ShopifyProduct): Promise<void> {
    const config = await this.getShopifyConfig();
    await this.syncSingleProduct(shopifyProduct, config.settings?.autoPublish ?? false);
  }

  async syncProducts(): Promise<{ imported: number; updated: number; errors: string[] }> {
    const config = await this.getShopifyConfig();
    const client = new ShopifyClient(config);

    const result = { imported: 0, updated: 0, errors: [] as string[] };

    try {
      // Update sync status
      await db
        .update(shopifyConfigs)
        .set({ syncStatus: "syncing" })
        .where(eq(shopifyConfigs.id, config.id));

      let hasMore = true;
      let sinceId: string | undefined;

      while (hasMore) {
        const response = await client.getProducts({ limit: 250, since_id: sinceId });
        const shopifyProducts = response.products;

        for (const shopifyProduct of shopifyProducts) {
          try {
            await this.syncSingleProduct(shopifyProduct, config.settings.autoPublish);
            result.imported++;
          } catch (error) {
            result.errors.push(`Failed to sync product ${shopifyProduct.id}: ${error}`);
          }
        }

        hasMore = shopifyProducts.length === 250;
        sinceId = shopifyProducts[shopifyProducts.length - 1]?.id.toString();
      }

      // Update sync timestamp
      await db
        .update(shopifyConfigs)
        .set({
          syncStatus: "idle",
          lastSyncAt: new Date()
        })
        .where(eq(shopifyConfigs.id, config.id));

    } catch (error) {
      // Reset sync status on error
      await db
        .update(shopifyConfigs)
        .set({ syncStatus: "error" })
        .where(eq(shopifyConfigs.id, config.id));

      throw error;
    }

    return result;
  }

  private async syncSingleProduct(shopifyProduct: ShopifyProduct, autoPublish: boolean) {
    const existingMapping = await db
      .select()
      .from(shopifyProductMappings)
      .where(
        and(
          eq(shopifyProductMappings.storeId, this.storeId),
          eq(shopifyProductMappings.shopifyProductId, shopifyProduct.id.toString())
        )
      )
      .limit(1);

    const productData = this.transformShopifyProduct(shopifyProduct, autoPublish);

    if (existingMapping[0]) {
      // Update existing product
      await db
        .update(products)
        .set(productData)
        .where(eq(products.id, existingMapping[0].localProductId));

      // Update mapping timestamp
      await db
        .update(shopifyProductMappings)
        .set({ lastSyncAt: new Date() })
        .where(eq(shopifyProductMappings.id, existingMapping[0].id));

      // Sync variants
      await this.syncProductVariants(shopifyProduct, existingMapping[0].localProductId);
    } else {
      // Create new product
      const newProductId = crypto.randomUUID();

      await db.insert(products).values({
        ...productData,
        id: newProductId,
        storeId: this.storeId,
      });

      // Create mapping
      await db.insert(shopifyProductMappings).values({
        id: crypto.randomUUID(),
        storeId: this.storeId,
        shopifyProductId: shopifyProduct.id.toString(),
        localProductId: newProductId,
        lastSyncAt: new Date(),
      });

      // Sync variants
      await this.syncProductVariants(shopifyProduct, newProductId);
    }
  }

  private async syncProductVariants(shopifyProduct: ShopifyProduct, localProductId: string) {
    for (const shopifyVariant of shopifyProduct.variants) {
      const existingMapping = await db
        .select()
        .from(shopifyVariantMappings)
        .where(
          and(
            eq(shopifyVariantMappings.storeId, this.storeId),
            eq(shopifyVariantMappings.shopifyVariantId, shopifyVariant.id.toString())
          )
        )
        .limit(1);

      const variantData = this.transformShopifyVariant(shopifyVariant, localProductId);

      if (existingMapping[0]) {
        // Update existing variant
        await db
          .update(productVariants)
          .set(variantData)
          .where(eq(productVariants.id, existingMapping[0].localVariantId));

        // Update mapping timestamp
        await db
          .update(shopifyVariantMappings)
          .set({ lastSyncAt: new Date() })
          .where(eq(shopifyVariantMappings.id, existingMapping[0].id));
      } else {
        // Create new variant
        const newVariantId = crypto.randomUUID();

        await db.insert(productVariants).values({
          ...variantData,
          id: newVariantId,
        });

        // Create mapping
        await db.insert(shopifyVariantMappings).values({
          id: crypto.randomUUID(),
          storeId: this.storeId,
          shopifyVariantId: shopifyVariant.id.toString(),
          localVariantId: newVariantId,
          lastSyncAt: new Date(),
        });
      }
    }
  }

  private transformShopifyProduct(shopifyProduct: ShopifyProduct, autoPublish: boolean): any {
    return {
      name: shopifyProduct.title,
      slug: shopifyProduct.handle,
      description: shopifyProduct.body_html || "",
      shortDescription: shopifyProduct.body_html ? shopifyProduct.body_html.substring(0, 200) : null,
      type: "physical" as const,
      status: autoPublish && shopifyProduct.status === "active" ? "active" : "draft",
      price: shopifyProduct.variants[0]?.price || "0",
      compareAtPrice: shopifyProduct.variants[0]?.compare_at_price || null,
      trackQuantity: true,
      quantity: shopifyProduct.variants[0]?.inventory_quantity || 0,
      allowBackorder: false,
      weight: shopifyProduct.variants[0]?.grams ? shopifyProduct.variants[0].grams / 1000 : null,
      metaTitle: shopifyProduct.title,
      metaDescription: shopifyProduct.body_html ? shopifyProduct.body_html.substring(0, 160) : null,
      images: shopifyProduct.images.map(img => ({
        id: crypto.randomUUID(),
        url: img.src,
        alt: shopifyProduct.title,
        isPrimary: img.position === 1,
      })) as ProductImage[],
      categories: [], // Could map from Shopify collections
      tags: shopifyProduct.tags ? shopifyProduct.tags.split(",").map(tag => tag.trim()) : [],
      featured: false,
      requiresShipping: shopifyProduct.variants[0]?.requires_shipping ?? true,
      taxable: shopifyProduct.variants[0]?.taxable ?? true,
      updatedAt: new Date(),
    };
  }

  private transformShopifyVariant(shopifyVariant: ShopifyVariant, localProductId: string): any {
    return {
      storeId: this.storeId,
      productId: localProductId,
      sku: shopifyVariant.sku,
      priceCents: Math.round(parseFloat(shopifyVariant.price) * 100),
      currency: "USD", // Assume USD, could be detected from store
      inventory: shopifyVariant.inventory_quantity,
      attributes: {
        title: shopifyVariant.title,
        option1: shopifyVariant.option1,
        option2: shopifyVariant.option2,
        option3: shopifyVariant.option3,
      },
    };
  }

  async syncInventory(): Promise<{ updated: number; errors: string[] }> {
    const config = await this.getShopifyConfig();
    const client = new ShopifyClient(config);

    const result = { updated: 0, errors: [] as string[] };

    try {
      // Get all variant mappings for this store
      const variantMappings = await db
        .select()
        .from(shopifyVariantMappings)
        .where(eq(shopifyVariantMappings.storeId, this.storeId));

      if (variantMappings.length === 0) {
        return result;
      }

      // Get inventory levels from Shopify
      const inventoryItemIds = variantMappings.map(m => m.shopifyVariantId);
      const inventoryResponse = await client.getInventoryLevels({
        inventory_item_ids: inventoryItemIds,
      });

      // Update local inventory
      for (const level of inventoryResponse.inventory_levels) {
        const mapping = variantMappings.find(m => m.shopifyVariantId === level.inventory_item_id.toString());
        if (mapping) {
          try {
            await db
              .update(productVariants)
              .set({
                inventory: level.available,
              })
              .where(eq(productVariants.id, mapping.localVariantId));

            result.updated++;
          } catch (error) {
            result.errors.push(`Failed to update inventory for variant ${mapping.localVariantId}: ${error}`);
          }
        }
      }

    } catch (error) {
      result.errors.push(`Inventory sync failed: ${error}`);
    }

    return result;
  }
}
