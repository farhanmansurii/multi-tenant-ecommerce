import { revalidateTag } from 'next/cache';

export const CACHE_TAGS = {
  store: (slug: string) => `store-${slug}`,
  products: (slug: string) => `products-${slug}`,
  product: (slug: string, productSlug: string) => `product-${slug}-${productSlug}`,
  categories: (slug: string) => `categories-${slug}`,
  analytics: (slug: string) => `analytics-${slug}`,
} as const;

export function revalidateStoreCache(storeSlug: string) {
  revalidateTag(CACHE_TAGS.store(storeSlug), 'max');
  revalidateTag(CACHE_TAGS.products(storeSlug), 'max');
  revalidateTag(CACHE_TAGS.categories(storeSlug), 'max');
}

export function revalidateProductCache(storeSlug: string, productSlug?: string) {
  revalidateTag(CACHE_TAGS.products(storeSlug), 'max');

  if (productSlug) {
    revalidateTag(CACHE_TAGS.product(storeSlug, productSlug), 'max');
  }
}

export function revalidateCategoryCache(storeSlug: string) {
  revalidateTag(CACHE_TAGS.categories(storeSlug), 'max');
}

export function revalidateAnalyticsCache(storeSlug: string) {
  revalidateTag(CACHE_TAGS.analytics(storeSlug), 'max');
}
