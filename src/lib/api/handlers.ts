import type { NextRequest } from "next/server";
import { badRequest } from "./responses";
import type { ApiContext } from "./context";
import { getApiContext, getApiContextOrNull } from "./context";

interface StoreContextOptions {
  enforceOwner?: boolean;
  getSession?: boolean;
}

export async function withStoreContext<T>(
  request: NextRequest,
  slugFromParams?: string,
  handler?: (ctx: { storeId: string; userId?: string; store: ApiContext["store"] }) => Promise<T>,
  options: StoreContextOptions = {}
) {
  const url = new URL(request.url);
  const slug = slugFromParams || url.pathname.split("/").filter(Boolean)[1];
  if (!slug) return badRequest("Missing store slug");

  const apiContextResult =
    options.enforceOwner || options.getSession
      ? await getApiContext(request, slug, {
          requireAuth: Boolean(options.getSession),
          requireOwner: Boolean(options.enforceOwner),
        })
      : await getApiContextOrNull(request, slug);

  if (apiContextResult instanceof Response) {
    return apiContextResult;
  }

  if (!apiContextResult) {
    return badRequest("Store context could not be resolved");
  }

  const normalized = {
    storeId: apiContextResult.storeId,
    userId: apiContextResult.userId || undefined,
    store: apiContextResult.store,
  };

  if (!handler) return normalized as unknown as T;
  return handler(normalized);
}
