export const CACHE_REVALIDATE = {
  STORE: 120,
  PRODUCTS: 60,
  PRODUCT: 120,
  ANALYTICS: 60,
  CATEGORIES: 300,
  RECENT_ACTIVITY: 30,
} as const;

export const CACHE_CONFIG = {
  STORE: {
    revalidate: CACHE_REVALIDATE.STORE,
    cacheControl: 'public, s-maxage=120, stale-while-revalidate=300',
    tags: (slug: string) => [`store-${slug}`],
  },
  PRODUCTS: {
    revalidate: CACHE_REVALIDATE.PRODUCTS,
    cacheControl: 'public, s-maxage=60, stale-while-revalidate=120',
    tags: (slug: string) => [`products-${slug}`, `store-${slug}`],
  },
  PRODUCT: {
    revalidate: CACHE_REVALIDATE.PRODUCT,
    cacheControl: 'public, s-maxage=120, stale-while-revalidate=300',
    tags: (slug: string, productSlug: string) => [`product-${slug}-${productSlug}`, `products-${slug}`, `store-${slug}`],
  },
  ANALYTICS: {
    revalidate: CACHE_REVALIDATE.ANALYTICS,
    cacheControl: 'private, s-maxage=60, stale-while-revalidate=120',
    tags: (slug: string) => [`analytics-${slug}`, `store-${slug}`],
  },
  CATEGORIES: {
    revalidate: CACHE_REVALIDATE.CATEGORIES,
    cacheControl: 'public, s-maxage=300, stale-while-revalidate=600',
    tags: (slug: string) => [`categories-${slug}`, `store-${slug}`],
  },
  RECENT_ACTIVITY: {
    revalidate: CACHE_REVALIDATE.RECENT_ACTIVITY,
    cacheControl: 'private, s-maxage=30, stale-while-revalidate=60',
    tags: (slug: string) => [`analytics-${slug}`, `store-${slug}`],
  },
  MUTATION: {
    cacheControl: 'no-store, no-cache, must-revalidate',
  },
} as const;
