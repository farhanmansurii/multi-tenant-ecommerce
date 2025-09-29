import { NextResponse } from "next/server";
import { z } from "zod";

import { storeHelpers } from "@/lib/domains/stores";
import { requireAuthOrNull } from "@/lib/session/helpers";

interface RouteParams {
  params: Promise<{
    slug: string;
    userId: string;
  }>;
}

const updateRoleSchema = z.object({
  role: z.enum(["admin", "member"]).optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requireAuthOrNull();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, userId } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const actorRole = await storeHelpers.getUserRole(store.id, session.user.id);
  if (actorRole !== "owner" && actorRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot modify your own membership" }, { status: 400 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = updateRoleSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.role) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await storeHelpers.updateStoreMemberRole(store.id, userId, parsed.data.role);
  return NextResponse.json({ member: updated });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await requireAuthOrNull();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, userId } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const actorRole = await storeHelpers.getUserRole(store.id, session.user.id);
  if (actorRole !== "owner" && actorRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  const deleted = await storeHelpers.removeStoreMember(store.id, userId);
  return NextResponse.json({ member: deleted });
}


