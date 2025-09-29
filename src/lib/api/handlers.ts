import { NextRequest } from "next/server";
import { badRequest, notFound } from "./responses";
import { resolveStoreContext, setTenantContext } from "@/lib/middleware/tenant";

export async function withStoreContext<T>(
  request: NextRequest,
  slugFromParams?: string,
  handler?: (ctx: { storeId: string }) => Promise<T>
) {
  const url = new URL(request.url);
  const slug = slugFromParams || url.pathname.split("/").filter(Boolean)[1];
  if (!slug) return badRequest("Missing store slug");

  const ctx = await resolveStoreContext(slug);
  if (!ctx) return notFound("Store not found");

  await setTenantContext(ctx.storeId);

  if (!handler) return ctx as unknown as T;
  return handler({ storeId: ctx.storeId });
}


