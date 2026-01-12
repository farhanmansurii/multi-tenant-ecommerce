import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { storeHelpers } from "@/lib/domains/stores";
import { auth } from "@/lib/auth/server";
import { ok, notFound, unauthorized, forbidden, serverError, logRouteError } from "@/lib/api/responses";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}


export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const store = await storeHelpers.getStoreBySlug(slug);
    if (!store) {
      return notFound("Store not found");
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

    return ok({
      store: {
        ...store,
        productCount: productCountResult?.count || 0,
        currentUserRole,
      },
    });
  } catch (error) {
    await logRouteError("Error fetching store", error, params);
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let storeId: string | undefined;
  try {
    const { slug } = await params;
    const existing = await storeHelpers.getStoreBySlug(slug);
    if (!existing) {
      return notFound("Store not found");
    }

    storeId = existing.id;

    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return unauthorized();
    }

    // Check if user is owner
    if (existing.ownerUserId !== session.user.id) {
      return forbidden();
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

    return ok({ store: updated });
  } catch (error) {
    await logRouteError("Error updating store", error, params, { storeId });
    return serverError("Failed to update store");
  }
}
