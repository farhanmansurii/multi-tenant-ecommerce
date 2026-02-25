import type { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { storeHelpers } from "@/lib/domains/stores";
import { getApiContext, getApiContextOrNull } from "@/lib/api/context";
import { ok, serverError, logRouteError, notFound } from "@/lib/api/responses";
import { CACHE_CONFIG } from "@/lib/api/cache-config";
import { revalidateStoreCache } from "@/lib/api/cache-revalidation";
import { parseJson } from "@/lib/api/validation";
import { updateStoreBodySchema } from "@/lib/schemas/store";

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

    const parsedBody = await parseJson(request, updateStoreBodySchema);
    if (parsedBody instanceof Response) return parsedBody;
    const body = parsedBody;

    const currentSettings = (existing.settings as any) || {};
    const newSettings = {
      ...currentSettings,
      storefrontContentMode: body.storefrontContentMode ?? currentSettings.storefrontContentMode,
      storefrontContent: body.storefrontContent ?? currentSettings.storefrontContent,
      storefrontDraftMode: body.storefrontDraftMode ?? currentSettings.storefrontDraftMode,
      storefrontDraftContent: body.storefrontDraftContent ?? currentSettings.storefrontDraftContent,
      storefrontDraftUpdatedAt: body.storefrontDraftUpdatedAt ?? currentSettings.storefrontDraftUpdatedAt,
      paymentMethods: body.paymentMethods ?? currentSettings.paymentMethods,
      codEnabled: body.codEnabled ?? currentSettings.codEnabled,
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
        slug: body.storeSlug ?? existing.slug,
        description: body.description ?? existing.description,
        contactEmail: body.email ?? existing.contactEmail,
        logo: body.logo ?? existing.logo,
        primaryColor: body.primaryColor ?? existing.primaryColor,
        currency: body.currency ?? existing.currency,
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
