import { NextResponse } from "next/server";
import { z } from "zod";

import { storeHelpers } from "@/lib/domains/stores";
import { requireAuthOrNull } from "@/lib/session/helpers";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "member"]).default("member"),
});

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const members = await storeHelpers.listStoreMembers(store.id);
  return NextResponse.json({ members });
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await requireAuthOrNull();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const userRole = await storeHelpers.getUserRole(store.id, session.user.id);
  if (userRole !== "owner" && userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = addMemberSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { userId, role } = parsed.data;

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
  }

  const created = await storeHelpers.addStoreMember(store.id, userId, role);
  return NextResponse.json({ member: created }, { status: 201 });
}


