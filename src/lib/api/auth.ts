import { NextRequest } from "next/server";

import { requireAuthOrNull } from "@/lib/session/helpers";
import { forbidden, notFound, unauthorized } from "./responses";
import { storeHelpers } from "@/lib/domains/stores";
import { setTenantContext } from "@/lib/middleware/tenant";

export interface ApiSessionContext {
  user: { id: string } & Record<string, unknown>;
}

export async function requireApiAuth(): Promise<ApiSessionContext | Response> {
  const session = await requireAuthOrNull();
  if (!session || !session.user) return unauthorized();
  return { user: session.user as ApiSessionContext["user"] };
}

export async function requireStoreRole(
  _request: NextRequest,
  slug: string,
  allowed: Array<"owner" | "admin" | "member">
): Promise<{ storeId: string } | Response> {
  const sessionOrResponse = await requireApiAuth();
  if (sessionOrResponse instanceof Response) return sessionOrResponse;

  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) return notFound("Store not found");

  const role = await storeHelpers.getUserRole(store.id, sessionOrResponse.user.id);
  if (!role || !allowed.includes(role as typeof allowed[number])) return forbidden();

  await setTenantContext(store.id);
  return { storeId: store.id };
}


