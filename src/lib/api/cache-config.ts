export const CACHE_CONFIG = {
  STORE: {
    revalidate: 120,
    cacheControl: 'public, s-maxage=120, stale-while-revalidate=300',
    tags: (slug: string) => [`store-${slug}`],
  },
  PRODUCTS: {
    revalidate: 60,
    cacheControl: 'public, s-maxage=60, stale-while-revalidate=120',
    tags: (slug: string) => [`products-${slug}`, `store-${slug}`],
  },
  PRODUCT: {
    revalidate: 120,
    cacheControl: 'public, s-maxage=120, stale-while-revalidate=300',
    tags: (slug: string, productSlug: string) => [`product-${slug}-${productSlug}`, `products-${slug}`, `store-${slug}`],
  },
  ANALYTICS: {
    revalidate: 60,
    cacheControl: 'private, s-maxage=60, stale-while-revalidate=120',
    tags: (slug: string) => [`analytics-${slug}`, `store-${slug}`],
  },
  CATEGORIES: {
    revalidate: 300,
    cacheControl: 'public, s-maxage=300, stale-while-revalidate=600',
    tags: (slug: string) => [`categories-${slug}`, `store-${slug}`],
  },
  RECENT_ACTIVITY: {
    revalidate: 30,
    cacheControl: 'private, s-maxage=30, stale-while-revalidate=60',
    tags: (slug: string) => [`analytics-${slug}`, `store-${slug}`],
  },
  MUTATION: {
    cacheControl: 'no-store, no-cache, must-revalidate',
  },
} as const;
