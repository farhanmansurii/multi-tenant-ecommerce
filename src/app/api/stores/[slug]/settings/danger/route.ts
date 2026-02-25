import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { getApiContext } from "@/lib/api/context";
import { ok, serverError, logRouteError } from "@/lib/api/responses";
import { CACHE_CONFIG } from "@/lib/api/cache-config";
import { revalidateStoreCache } from "@/lib/api/cache-revalidation";
import { parseJson } from "@/lib/api/validation";
import { updateDangerSettingsBodySchema } from "@/lib/schemas/store";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let storeId: string | undefined;
  try {
    const { slug } = await params;
    const ctx = await getApiContext(request, slug, { requireOwner: true });
    if (ctx instanceof Response) return ctx;

    storeId = ctx.storeId;
    const parsedBody = await parseJson(request, updateDangerSettingsBodySchema);
    if (parsedBody instanceof Response) return parsedBody;

    const nextStatus = parsedBody.action === "suspend" ? "suspended" : "active";

    const [updated] = await db
      .update(stores)
      .set({
        status: nextStatus,
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
    await logRouteError("Error updating danger settings", error, params, { storeId });
    return serverError("Failed to update danger settings");
  }
}
