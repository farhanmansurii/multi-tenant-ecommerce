export const queryKeys = {
  stores: {
    all: ["stores"] as const,
    detail: (slug: string) => ["store", slug] as const,
    analytics: (slug: string) => ["store", slug, "analytics"] as const,
  },
  products: {
    all: (storeSlug: string) => ["products", storeSlug] as const,
    detail: (storeSlug: string, productSlug: string) =>
      ["product", storeSlug, productSlug] as const,
    count: (storeSlug: string) => ["productCount", storeSlug] as const,
    recommendations: (storeSlug: string, productSlug: string) =>
      ["productRecommendations", storeSlug, productSlug] as const,
  },
  categories: {
    all: (storeSlug: string) => ["categories", storeSlug] as const,
    detail: (storeSlug: string, categoryId: string) =>
      ["category", storeSlug, categoryId] as const,
  },
  orders: {
    all: (storeSlug: string, filters?: { status?: string; customerId?: string }) =>
      ["orders", storeSlug, filters] as const,
    detail: (storeSlug: string, orderId: string) =>
      ["order", storeSlug, orderId] as const,
  },
  customers: {
    all: (storeSlug: string, search?: string) =>
      ["customers", storeSlug, search] as const,
    detail: (storeSlug: string, customerId: string) =>
      ["customer", storeSlug, customerId] as const,
  },
  discounts: {
    all: (storeSlug: string) => ["discounts", storeSlug] as const,
    detail: (storeSlug: string, discountId: string) =>
      ["discount", storeSlug, discountId] as const,
  },
} as const;
