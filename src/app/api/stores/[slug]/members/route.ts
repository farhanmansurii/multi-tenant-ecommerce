import type { NextRequest } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import { getApiContext, getApiContextOrNull } from "@/lib/api/context";
import { ok, created, notFound, forbidden, badRequest } from "@/lib/api/responses";
import { parseJson } from "@/lib/api/validation";
import { addStoreMemberBodySchema } from "@/lib/schemas/store";
import { CACHE_CONFIG } from "@/lib/api/cache-config";
import { revalidateStoreCache } from "@/lib/api/cache-revalidation";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const ctx = await getApiContextOrNull(request, slug);
  if (ctx instanceof Response) return ctx;
  if (!ctx) return notFound("Store not found");

  const members = await storeHelpers.listStoreMembers(ctx.storeId);
  return ok({ members });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const ctx = await getApiContext(request, slug, { requireAuth: true });
  if (ctx instanceof Response) return ctx;

  const userRole = await storeHelpers.getUserRole(ctx.storeId, ctx.userId);
  if (userRole !== "owner" && userRole !== "admin") {
    return forbidden();
  }

  const body = await parseJson(request, addStoreMemberBodySchema);
  if (body instanceof Response) return body;
  const userId = body.userId;
  const role = body.role ?? "member";

  if (userId === ctx.userId) {
    return badRequest("Cannot add yourself");
  }

  const createdMember = await storeHelpers.addStoreMember(ctx.storeId, userId, role);
  revalidateStoreCache(slug);
  return created(
    { member: createdMember },
    {
      headers: {
        "Cache-Control": CACHE_CONFIG.MUTATION.cacheControl,
      },
    },
  );
}
