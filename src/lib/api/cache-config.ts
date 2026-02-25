import { buildCacheTags } from "./cache-revalidation";

export const CACHE_REVALIDATE = {
  STORE: 120,
  PRODUCTS: 60,
  PRODUCT: 120,
  ORDERS: 120,
  ANALYTICS: 60,
  CATEGORIES: 300,
  RECENT_ACTIVITY: 30,
} as const;

const CACHE_POLICY = {
  READ_PUBLIC_SHORT: "public, s-maxage=60, stale-while-revalidate=120",
  READ_PUBLIC_MEDIUM: "public, s-maxage=120, stale-while-revalidate=300",
  READ_PUBLIC_LONG: "public, s-maxage=300, stale-while-revalidate=600",
  READ_PRIVATE_SHORT: "private, s-maxage=60, stale-while-revalidate=120",
  READ_PRIVATE_XSHORT: "private, s-maxage=30, stale-while-revalidate=60",
  MUTATION: "no-store, no-cache, must-revalidate",
} as const;

export const CACHE_CONFIG = {
  STORE: {
    revalidate: CACHE_REVALIDATE.STORE,
    cacheControl: CACHE_POLICY.READ_PUBLIC_MEDIUM,
    tags: (slug: string) => buildCacheTags("store", slug),
  },
  PRODUCTS: {
    revalidate: CACHE_REVALIDATE.PRODUCTS,
    cacheControl: CACHE_POLICY.READ_PUBLIC_SHORT,
    tags: (slug: string) => buildCacheTags("products", slug),
  },
  PRODUCT: {
    revalidate: CACHE_REVALIDATE.PRODUCT,
    cacheControl: CACHE_POLICY.READ_PUBLIC_MEDIUM,
    tags: (slug: string, productSlug: string) => buildCacheTags("product", slug, productSlug),
  },
  ORDERS: {
    revalidate: CACHE_REVALIDATE.ORDERS,
    cacheControl: CACHE_POLICY.READ_PRIVATE_SHORT,
    tags: (slug: string) => buildCacheTags("orders", slug),
  },
  ANALYTICS: {
    revalidate: CACHE_REVALIDATE.ANALYTICS,
    cacheControl: CACHE_POLICY.READ_PRIVATE_SHORT,
    tags: (slug: string) => buildCacheTags("analytics", slug),
  },
  CATEGORIES: {
    revalidate: CACHE_REVALIDATE.CATEGORIES,
    cacheControl: CACHE_POLICY.READ_PUBLIC_LONG,
    tags: (slug: string) => buildCacheTags("categories", slug),
  },
  RECENT_ACTIVITY: {
    revalidate: CACHE_REVALIDATE.RECENT_ACTIVITY,
    cacheControl: CACHE_POLICY.READ_PRIVATE_XSHORT,
    tags: (slug: string) => buildCacheTags("analytics", slug),
  },
  MUTATION: {
    cacheControl: CACHE_POLICY.MUTATION,
  },
} as const;
