import { NextRequest } from "next/server";
import { z } from "zod";

import { storeHelpers } from "@/lib/domains/stores";
import { requireAuthOrNull } from "@/lib/session/helpers";
import { ok, unauthorized, notFound, forbidden, badRequest } from "@/lib/api/responses";

interface RouteParams {
  params: Promise<{
    slug: string;
    userId: string;
  }>;
}

const updateRoleSchema = z.object({
  role: z.enum(["admin", "member"]).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireAuthOrNull();
  if (!session) return unauthorized();

  const { slug, userId } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) return notFound("Store not found");

  const actorRole = await storeHelpers.getUserRole(store.id, session.user.id);
  if (actorRole !== "owner" && actorRole !== "admin") {
    return forbidden();
  }

  if (userId === session.user.id) {
    return badRequest("Cannot modify your own membership");
  }

  const payload = await request.json().catch(() => null);
  const parsed = updateRoleSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.role) {
    return badRequest("Invalid payload");
  }

  const updated = await storeHelpers.updateStoreMemberRole(store.id, userId, parsed.data.role);
  return ok({ member: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAuthOrNull();
  if (!session) return unauthorized();

  const { slug, userId } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) return notFound("Store not found");

  const actorRole = await storeHelpers.getUserRole(store.id, session.user.id);
  if (actorRole !== "owner" && actorRole !== "admin") {
    return forbidden();
  }

  if (userId === session.user.id) {
    return badRequest("Cannot remove yourself");
  }

  const deleted = await storeHelpers.removeStoreMember(store.id, userId);
  return ok({ member: deleted });
}


