import type { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { stores, storeMembers } from "@/lib/db/schema";
import { getApiContext } from "@/lib/api/context";
import { forbidden, ok, serverError, logRouteError } from "@/lib/api/responses";
import { CACHE_CONFIG } from "@/lib/api/cache-config";
import { revalidateStoreCache } from "@/lib/api/cache-revalidation";
import { parseJson } from "@/lib/api/validation";
import { updateStorefrontSettingsBodySchema } from "@/lib/schemas/store";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let storeId: string | undefined;
  try {
    const { slug } = await params;
    const ctx = await getApiContext(request, slug, { requireAuth: true });
    if (ctx instanceof Response) return ctx;

    const isOwner = ctx.store.ownerUserId === ctx.userId;
    if (!isOwner) {
      const [member] = await db
        .select({ role: storeMembers.role })
        .from(storeMembers)
        .where(and(eq(storeMembers.storeId, ctx.storeId), eq(storeMembers.userId, ctx.userId)))
        .limit(1);
      if (member?.role !== "admin") {
        return forbidden("Only owners and admins can update storefront settings.");
      }
    }

    storeId = ctx.storeId;
    const parsedBody = await parseJson(request, updateStorefrontSettingsBodySchema);
    if (parsedBody instanceof Response) return parsedBody;
    const body = parsedBody;

    const currentSettings = (ctx.store.settings as Record<string, unknown> | null) ?? {};
    const storefrontPatch: Record<string, unknown> = {
      ...("storefrontContentMode" in body ? { storefrontContentMode: body.storefrontContentMode } : {}),
      ...("storefrontContent" in body ? { storefrontContent: body.storefrontContent } : {}),
    };

    const [updated] = await db
      .update(stores)
      .set({
        settings: {
          ...currentSettings,
          ...storefrontPatch,
        } as typeof stores.$inferSelect.settings,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, ctx.storeId))
      .returning();

    revalidateStoreCache(slug);

    return ok(
      { store: updated },
      {
        headers: {
          "Cache-Control": CACHE_CONFIG.MUTATION.cacheControl,
        },
      },
    );
  } catch (error) {
    await logRouteError("Error updating storefront settings", error, params, { storeId });
    return serverError("Failed to update storefront settings");
  }
}
