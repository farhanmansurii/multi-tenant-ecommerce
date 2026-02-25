import { revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  store: (slug: string) => `store:${slug}`,
  products: (slug: string) => `store:${slug}:products`,
  product: (slug: string, productSlug: string) => `store:${slug}:products:${productSlug}`,
  categories: (slug: string) => `store:${slug}:categories`,
  analytics: (slug: string) => `store:${slug}:analytics`,
  orders: (slug: string) => `store:${slug}:orders`,
} as const;

export function buildCacheTags(scope: keyof typeof CACHE_TAGS, slug: string, resourceSlug?: string) {
  if (scope === "product") {
    if (!resourceSlug) {
      throw new Error("product cache tags require a resource slug");
    }
    return [CACHE_TAGS.product(slug, resourceSlug), CACHE_TAGS.products(slug), CACHE_TAGS.store(slug)];
  }

  const tagFactory = CACHE_TAGS[scope] as (slugValue: string) => string;
  const primaryTag = tagFactory(slug);
  return primaryTag === CACHE_TAGS.store(slug) ? [primaryTag] : [primaryTag, CACHE_TAGS.store(slug)];
}

export function revalidateStoreCache(storeSlug: string) {
  revalidateTag(CACHE_TAGS.store(storeSlug), "max");
  revalidateTag(CACHE_TAGS.products(storeSlug), "max");
  revalidateTag(CACHE_TAGS.categories(storeSlug), "max");
  revalidateTag(CACHE_TAGS.orders(storeSlug), "max");
}

export function revalidateProductCache(storeSlug: string, productSlug?: string) {
  revalidateTag(CACHE_TAGS.products(storeSlug), "max");

  if (productSlug) {
    revalidateTag(CACHE_TAGS.product(storeSlug, productSlug), "max");
  }
}

export function revalidateCategoryCache(storeSlug: string) {
  revalidateTag(CACHE_TAGS.categories(storeSlug), "max");
}

export function revalidateOrderCache(storeSlug: string) {
  revalidateTag(CACHE_TAGS.orders(storeSlug), "max");
}

export function revalidateAnalyticsCache(storeSlug: string) {
  revalidateTag(CACHE_TAGS.analytics(storeSlug), "max");
}
