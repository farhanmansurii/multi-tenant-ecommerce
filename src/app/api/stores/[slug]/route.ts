import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { requireAuthOrNull } from "@/lib/session-helpers";
import { storeSchema } from "@/lib/validations/store";

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

    await db.transaction(async (tx) => {
      await tx.delete(products).where(eq(products.storeId, store.id));
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
