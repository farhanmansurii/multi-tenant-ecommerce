import type { NextRequest } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import { getApiContext } from "@/lib/api/context";
import { ok, forbidden, badRequest } from "@/lib/api/responses";
import { parseJson } from "@/lib/api/validation";
import { updateStoreMemberRoleBodySchema } from "@/lib/schemas/store";
import { CACHE_CONFIG } from "@/lib/api/cache-config";
import { revalidateStoreCache } from "@/lib/api/cache-revalidation";

interface RouteParams {
  params: Promise<{
    slug: string;
    userId: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { slug, userId } = await params;
  const ctx = await getApiContext(request, slug, { requireAuth: true });
  if (ctx instanceof Response) return ctx;

  const actorRole = await storeHelpers.getUserRole(ctx.storeId, ctx.userId);
  if (actorRole !== "owner" && actorRole !== "admin") {
    return forbidden();
  }

  if (userId === ctx.userId) {
    return badRequest("Cannot modify your own membership");
  }

  const body = await parseJson(request, updateStoreMemberRoleBodySchema);
  if (body instanceof Response) return body;

  const updated = await storeHelpers.updateStoreMemberRole(ctx.storeId, userId, body.role);
  revalidateStoreCache(slug);
  return ok(
    { member: updated },
    {
      headers: {
        "Cache-Control": CACHE_CONFIG.MUTATION.cacheControl,
      },
    },
  );
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { slug, userId } = await params;
  const ctx = await getApiContext(request, slug, { requireAuth: true });
  if (ctx instanceof Response) return ctx;

  const actorRole = await storeHelpers.getUserRole(ctx.storeId, ctx.userId);
  if (actorRole !== "owner" && actorRole !== "admin") {
    return forbidden();
  }

  if (userId === ctx.userId) {
    return badRequest("Cannot remove yourself");
  }

  const deleted = await storeHelpers.removeStoreMember(ctx.storeId, userId);
  revalidateStoreCache(slug);
  return ok(
    { member: deleted },
    {
      headers: {
        "Cache-Control": CACHE_CONFIG.MUTATION.cacheControl,
      },
    },
  );
}

