import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { storeHelpers } from "@/lib/domains/stores";
import { getApiContext, getApiContextOrNull } from "@/lib/api/context";
import { ok, serverError, logRouteError, notFound } from "@/lib/api/responses";
import { CACHE_CONFIG } from "@/lib/api/cache-config";
import { revalidateStoreCache } from "@/lib/api/cache-revalidation";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 120;

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const ctx = await getApiContextOrNull(request, slug);
    if (ctx instanceof Response) return ctx;
    if (!ctx) return notFound("Store not found");

    const [productCountResult, currentUserRole] = await Promise.all([
      db
        .select({ count: sql<number>`COUNT(*)::int`.as("count") })
        .from(products)
        .where(eq(products.storeId, ctx.storeId)),
      ctx.userId
        ? ctx.store.ownerUserId === ctx.userId
          ? Promise.resolve("owner" as const)
          : storeHelpers.getUserRole(ctx.storeId, ctx.userId)
        : Promise.resolve(null),
    ]);

    const response = ok(
      {
        store: {
          ...ctx.store,
          productCount: productCountResult[0]?.count || 0,
          currentUserRole,
        },
      },
      {
        headers: {
          'Cache-Control': CACHE_CONFIG.STORE.cacheControl,
        },
      }
    );

    response.headers.set('Cache-Tag', CACHE_CONFIG.STORE.tags(slug).join(', '));
    return response;
  } catch (error) {
    await logRouteError("Error fetching store", error, params);
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let storeId: string | undefined;
  try {
    const { slug } = await params;
    const ctx = await getApiContext(request, slug, { requireOwner: true });
    if (ctx instanceof Response) return ctx;

    storeId = ctx.storeId;
    const existing = ctx.store;

    const body = await request.json();

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
        name: body.storeName ?? existing.name,
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
      .where(eq(stores.id, ctx.storeId))
      .returning();

    revalidateStoreCache(slug);

    return ok(
      { store: updated },
      {
        headers: {
          'Cache-Control': CACHE_CONFIG.MUTATION.cacheControl,
        },
      }
    );
  } catch (error) {
    await logRouteError("Error updating store", error, params, { storeId });
    return serverError("Failed to update store");
  }
}
