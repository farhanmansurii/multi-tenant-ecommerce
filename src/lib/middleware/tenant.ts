import "server-only";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export interface TenantContext {
  storeId: string;
  store: {
    id: string;
    slug: string;
    name: string;
    ownerUserId: string;
  };
}

/**
 * Extract store slug from subdomain or path
 */
export function extractStoreSlug(request: NextRequest): string | null {
  const url = new URL(request.url);

  // Check subdomain first (e.g., mystore.multi-tenant-ecommerce-self.vercel.app)
  const hostname = url.hostname;
  if (hostname.includes('.')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'www' && subdomain !== 'localhost') {
      return subdomain;
    }
  }

  // Check path segments (e.g., /stores/mystore/...)
  const pathSegments = url.pathname.split('/').filter(Boolean);
  if (pathSegments[0] === 'stores' && pathSegments[1]) {
    return pathSegments[1];
  }

  return null;
}

/**
 * Resolve store slug to store ID and basic info
 */
export async function resolveStoreContext(storeSlug: string): Promise<TenantContext | null> {
  try {
    const store = await db
      .select({
        id: stores.id,
        slug: stores.slug,
        name: stores.name,
        ownerUserId: stores.ownerUserId,
      })
      .from(stores)
      .where(eq(stores.slug, storeSlug))
      .limit(1);

    if (store.length === 0) {
      return null;
    }

    return {
      storeId: store[0].id,
      store: store[0],
    };
  } catch (error) {
    console.error("Error resolving store context:", error);
    return null;
  }
}

/**
 * Set tenant context for RLS
 */
export async function setTenantContext(storeId: string) {
  // Parameterize to avoid injection through storeId.
  await db.execute(sql`SELECT set_config('app.current_store_id', ${storeId}, true)`);
}
