import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { products, stores, categories } from "@/lib/db/schema";
import { requireAuthOrNull } from "@/lib/session-helpers";
import { storeSchema } from "@/lib/validations/store";
import { deleteUploadThingFiles } from "@/lib/uploadthing-delete";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;

  try {
    // Find the store by slug
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);

    if (store.length === 0) {
      return NextResponse.json(
        {
          error: "Store not found",
          message: `No store found with slug: ${slug}`
        },
        { status: 404 }
      );
    }

    const storeData = store[0];

    // Get product count for this store
    const [productCountResult] = await db
      .select({
        count: sql<number>`COUNT(*)::int`.as('count')
      })
      .from(products)
      .where(eq(products.storeId, storeData.id));

    const storeDataWithCount = {
      ...storeData,
      productCount: productCountResult?.count || 0
    };

    // Return the store data as JSON
    return NextResponse.json({
      success: true,
      store: storeDataWithCount,
      url: `sellmystuff.com/${storeDataWithCount.slug}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching the store data"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await requireAuthOrNull();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const existingStore = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);

    if (existingStore.length === 0) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const store = existingStore[0];

    if (store.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all products and categories to collect their images
    const storeProducts = await db
      .select({ images: products.images })
      .from(products)
      .where(eq(products.storeId, store.id));

    const storeCategories = await db
      .select({ image: categories.image })
      .from(categories)
      .where(eq(categories.storeId, store.id));

    // Collect all file URLs to delete
    const filesToDelete: string[] = [];

    // Add store logo and favicon
    if (store.logo) filesToDelete.push(store.logo);
    if (store.favicon) filesToDelete.push(store.favicon);

    // Add category images
    storeCategories.forEach(category => {
      if (category.image) filesToDelete.push(category.image);
    });

    // Add product images
    storeProducts.forEach(product => {
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((img: { url?: string }) => {
          if (img.url) filesToDelete.push(img.url);
        });
      }
    });

    // Delete all files from UploadThing
    if (filesToDelete.length > 0) {
      try {
        const deleteResult = await deleteUploadThingFiles(filesToDelete);
        if (deleteResult.success) {
          console.log(`Deleted ${deleteResult.deletedCount} files from UploadThing for store: ${store.slug}`);
        } else {
          console.error("Failed to delete some files:", deleteResult.errors);
        }
      } catch (error) {
        console.error("Failed to delete files from UploadThing:", error);
        // Continue with store deletion even if file deletion fails
      }
    }

    await db.transaction(async (tx) => {
      await tx.delete(products).where(eq(products.storeId, store.id));
      await tx.delete(categories).where(eq(categories.storeId, store.id));
      await tx.delete(stores).where(eq(stores.id, store.id));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requireAuthOrNull();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const existingStore = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);

    if (existingStore.length === 0) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const store = existingStore[0];

    if (store.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = await request.json();
    const parsed = storeSchema.parse(payload);

    // Handle logo and favicon changes - delete old files if they're being replaced
    const filesToDelete: string[] = [];

    if (store.logo && store.logo !== parsed.logo) {
      filesToDelete.push(store.logo);
    }

    if (store.favicon && store.favicon !== parsed.favicon) {
      filesToDelete.push(store.favicon);
    }

    // Delete old files from UploadThing
    if (filesToDelete.length > 0) {
      try {
        const deleteResult = await deleteUploadThingFiles(filesToDelete);
        if (deleteResult.success) {
          console.log(`Deleted ${deleteResult.deletedCount} old store files from UploadThing`);
        } else {
          console.error("Failed to delete some old store files:", deleteResult.errors);
        }
      } catch (error) {
        console.error("Failed to delete old store files from UploadThing:", error);
        // Continue with update even if old file deletion fails
      }
    }

    await db
      .update(stores)
      .set({
        name: parsed.storeName,
        slug: parsed.storeSlug,
        tagline: parsed.tagline ?? null,
        description: parsed.description,
        contactEmail: parsed.email,
        contactPhone: parsed.phone || null,
        website: parsed.website || null,
        businessType: parsed.businessType,
        businessName: parsed.businessName,
        taxId: parsed.taxId || null,
        addressLine1: parsed.address,
        city: parsed.city,
        state: parsed.state,
        zipCode: parsed.zipCode,
        country: parsed.country,
        logo: parsed.logo || null,
        favicon: parsed.favicon || null,
        primaryColor: parsed.primaryColor,
        secondaryColor: parsed.secondaryColor || null,
        currency: parsed.currency,
        timezone: parsed.timezone,
        language: parsed.language,
        paymentMethods: parsed.paymentMethods,
        shippingEnabled: parsed.shippingEnabled,
        freeShippingThreshold:
          parsed.freeShippingThreshold !== undefined && parsed.freeShippingThreshold !== null
            ? parsed.freeShippingThreshold.toString()
            : null,
        shippingRates: parsed.shippingRates ?? [],
        termsOfService: parsed.termsOfService,
        privacyPolicy: parsed.privacyPolicy,
        refundPolicy: parsed.refundPolicy,
        status: parsed.status,
        featured: parsed.featured,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, store.id));

    const [updatedStore] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, store.id))
      .limit(1);

    return NextResponse.json({ success: true, store: updatedStore });
  } catch (error) {
    console.error('Error updating store:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
