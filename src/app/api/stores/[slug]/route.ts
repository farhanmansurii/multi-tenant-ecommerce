import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { storeHelpers } from "@/lib/domains/stores";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

import { auth } from "@/lib/auth/server";


export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;

  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const [productCountResult] = await db
    .select({ count: sql<number>`COUNT(*)::int`.as("count") })
    .from(products)
    .where(eq(products.storeId, store.id));

  // Get current user session to determine role
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  let currentUserRole = null;
  if (session?.user) {
    // Check if owner
    if (store.ownerUserId === session.user.id) {
      currentUserRole = "owner";
    } else {
      // Check member role
      currentUserRole = await storeHelpers.getUserRole(store.id, session.user.id);
    }
  }

  return NextResponse.json({
    store: {
      ...store,
      productCount: productCountResult?.count || 0,
      currentUserRole,
    },
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const existing = await storeHelpers.getStoreBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await request.json();

  // Construct the settings object by merging existing settings with new values
  const currentSettings = (existing.settings as any) || {};
  const newSettings = {
    ...currentSettings,
    paymentMethods: body.paymentMethods ?? currentSettings.paymentMethods,
    shippingRates: body.shippingRates ?? currentSettings.shippingRates,
    upiId: body.upiId ?? currentSettings.upiId,
    codEnabled: body.codEnabled ?? currentSettings.codEnabled,
    stripeAccountId: body.stripeAccountId ?? currentSettings.stripeAccountId,
    paypalEmail: body.paypalEmail ?? currentSettings.paypalEmail,
    shippingEnabled: body.shippingEnabled ?? currentSettings.shippingEnabled,
    freeShippingThreshold: body.freeShippingThreshold ?? currentSettings.freeShippingThreshold,
    termsOfService: body.termsOfService ?? currentSettings.termsOfService,
    privacyPolicy: body.privacyPolicy ?? currentSettings.privacyPolicy,
    refundPolicy: body.refundPolicy ?? currentSettings.refundPolicy,
  };

  const [updated] = await db
    .update(stores)
    .set({
      name: body.storeName ?? existing.name, // Note: form sends storeName, DB expects name
      description: body.description ?? existing.description,
      tagline: body.tagline ?? existing.tagline,
      contactEmail: body.email ?? existing.contactEmail,
      contactPhone: body.phone ?? existing.contactPhone,
      website: body.website ?? existing.website,
      businessType: body.businessType ?? existing.businessType,
      businessName: body.businessName ?? existing.businessName,
      taxId: body.taxId ?? existing.taxId,
      addressLine1: body.address ?? existing.addressLine1,
      city: body.city ?? existing.city,
      state: body.state ?? existing.state,
      zipCode: body.zipCode ?? existing.zipCode,
      country: body.country ?? existing.country,
      logo: body.logo ?? existing.logo,
      favicon: body.favicon ?? existing.favicon,
      primaryColor: body.primaryColor ?? existing.primaryColor,
      secondaryColor: body.secondaryColor ?? existing.secondaryColor,
      currency: body.currency ?? existing.currency,
      timezone: body.timezone ?? existing.timezone,
      language: body.language ?? existing.language,
      settings: newSettings,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, existing.id))
    .returning();

  return NextResponse.json({ store: updated });
}
