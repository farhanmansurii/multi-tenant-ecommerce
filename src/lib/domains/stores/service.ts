import { withBaseUrl } from "@/lib/utils/url";
import { StoreData, StoreFormPayload } from "./types";

interface ProductsResponse {
  count: number;
  products?: unknown[];
}

export async function fetchStores() {
  const response = await fetch(withBaseUrl("/api/stores"));
  if (!response.ok) {
    throw new Error(
      response.status === 404 ? "Stores not found" : "Failed to load stores"
    );
  }
  return response.json();
}

export const fetchStore = async (slug: string): Promise<StoreData> => {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}`));
  if (!response.ok) {
    throw new Error(
      response.status === 404 ? "Store not found" : "Failed to load store"
    );
  }
  const data = await response.json();
  return data.store;
};

export async function createStore(data: StoreFormPayload): Promise<StoreData> {
  const response = await fetch(withBaseUrl("/api/stores"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || errorData?.message || "Failed to create store");
  }

  const result = await response.json();
  return result.store;
}

export async function updateStore(slug: string, data: StoreFormPayload): Promise<StoreData> {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to update store");
  }

  const result = await response.json();
  return result.store;
}

export async function fetchProductStats(slug: string): Promise<number> {
  const res = await fetch(withBaseUrl(`/api/stores/${slug}/products`));
  if (!res.ok) return 0;
  const data = (await res.json()) as ProductsResponse;
  if (Array.isArray(data.products)) return data.products.length;
  return 0;
}

export async function fetchStoreAnalytics(slug: string) {
  const response = await fetch(withBaseUrl(`/api/stores/${slug}/analytics`));
  if (!response.ok) {
    throw new Error("Failed to load analytics");
  }
  const data = await response.json();
  return {
    analytics: data.analytics,
    currency: data.currency || "INR",
    storeName: data.storeName,
  };
}
