import { NextRequest } from "next/server";
import { z } from "zod";

import { storeHelpers } from "@/lib/domains/stores";
import { getApiContext, getApiContextOrNull } from "@/lib/api/context";
import { ok, created, notFound, forbidden, badRequest } from "@/lib/api/responses";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "member"]).default("member"),
});

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

  const payload = await request.json().catch(() => null);
  const parsed = addMemberSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Invalid payload");
  }

  const { userId, role } = parsed.data;

  if (userId === ctx.userId) {
    return badRequest("Cannot add yourself");
  }

  const createdMember = await storeHelpers.addStoreMember(ctx.storeId, userId, role);
  return created({ member: createdMember });
}


