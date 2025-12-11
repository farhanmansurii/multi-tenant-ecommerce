import { NextRequest, NextResponse } from "next/server";
import { badRequest, notFound, unauthorized, forbidden } from "./responses";
import { resolveStoreContext, setTenantContext } from "@/lib/middleware/tenant";
import { auth } from "@/lib/auth/server";

interface StoreContextOptions {
  enforceOwner?: boolean;
  getSession?: boolean;
}

export async function withStoreContext<T>(
  request: NextRequest,
  slugFromParams?: string,
  handler?: (ctx: { storeId: string; userId?: string; store: any }) => Promise<T>,
  options: StoreContextOptions = {}
) {
  const url = new URL(request.url);
  const slug = slugFromParams || url.pathname.split("/").filter(Boolean)[1];
  if (!slug) return badRequest("Missing store slug");

  const ctx = await resolveStoreContext(slug);
  if (!ctx) return notFound("Store not found");

  let userId: string | undefined;

  if (options.enforceOwner || options.getSession) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (options.enforceOwner) {
      if (!session) {
        return unauthorized("Authentication required");
      }

      if (session.user.id !== ctx.store.ownerUserId) {
        return forbidden("You do not have permission to access this store");
      }
    }

    if (session) {
      userId = session.user.id;
    }
  }

  await setTenantContext(ctx.storeId);

  if (!handler) return { storeId: ctx.storeId, userId, store: ctx.store } as unknown as T;
  return handler({ storeId: ctx.storeId, userId, store: ctx.store });
}


