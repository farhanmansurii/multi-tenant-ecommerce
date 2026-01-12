import { NextRequest } from "next/server";
import { z } from "zod";

import { storeHelpers } from "@/lib/domains/stores";
import { requireAuthOrNull } from "@/lib/session/helpers";
import { ok, created, unauthorized, notFound, forbidden, badRequest } from "@/lib/api/responses";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "member"]).default("member"),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) return notFound("Store not found");

  const members = await storeHelpers.listStoreMembers(store.id);
  return ok({ members });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await requireAuthOrNull();
  if (!session) return unauthorized();

  const { slug } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) return notFound("Store not found");

  const userRole = await storeHelpers.getUserRole(store.id, session.user.id);
  if (userRole !== "owner" && userRole !== "admin") {
    return forbidden();
  }

  const payload = await request.json().catch(() => null);
  const parsed = addMemberSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Invalid payload");
  }

  const { userId, role } = parsed.data;

  if (userId === session.user.id) {
    return badRequest("Cannot add yourself");
  }

  const createdMember = await storeHelpers.addStoreMember(store.id, userId, role);
  return created({ member: createdMember });
}


