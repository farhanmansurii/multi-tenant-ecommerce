import { NextRequest } from "next/server";
import { cache } from "react";
import { auth } from "@/lib/auth/server";
import { storeHelpers } from "@/lib/domains/stores";
import { unauthorized, notFound, forbidden } from "./responses";
import { setTenantContext } from "@/lib/middleware/tenant";

interface ApiContext {
  session: {
    user: {
      id: string;
      email: string;
      name?: string;
    };
  };
  store: Awaited<ReturnType<typeof storeHelpers.getStoreBySlug>>;
  userId: string;
  storeId: string;
}

interface ApiContextOptions {
  requireAuth?: boolean;
  requireOwner?: boolean;
}

const getCachedSession = cache(async (headers: Headers) => {
  try {
    return await auth.api.getSession({ headers });
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
});

export async function getApiContext(
  request: NextRequest,
  slug: string,
  options: ApiContextOptions = {}
): Promise<ApiContext | Response> {
  const { requireAuth = false, requireOwner = false } = options;

  const [session, store] = await Promise.all([
    getCachedSession(request.headers),
    storeHelpers.getStoreBySlug(slug),
  ]);

  if (requireAuth && !session) {
    return unauthorized();
  }

  if (!store) {
    return notFound("Store not found");
  }

  if (requireOwner) {
    if (!session) {
      return unauthorized();
    }
    if (store.ownerUserId !== session.user.id) {
      return forbidden("You do not have permission to access this store");
    }
  }

  await setTenantContext(store.id);

  return {
    session: session!,
    store,
    userId: session?.user.id || "",
    storeId: store.id,
  };
}

export async function getApiContextOrNull(
  request: NextRequest,
  slug: string
): Promise<ApiContext | null | Response> {
  const [session, store] = await Promise.all([
    getCachedSession(request.headers),
    storeHelpers.getStoreBySlug(slug),
  ]);

  if (!store) {
    return notFound("Store not found");
  }

  if (!session) {
    return null;
  }

  await setTenantContext(store.id);

  return {
    session,
    store,
    userId: session.user.id,
    storeId: store.id,
  };
}
