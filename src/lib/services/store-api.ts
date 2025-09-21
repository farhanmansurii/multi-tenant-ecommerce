import { StoreData } from "../types/store";

interface ProductsResponse {
  count: number;
  products?: unknown[];
}

export async function fetchStores() {
  const response = await fetch("/api/stores");
  if (!response.ok) {
    throw new Error(
      response.status === 404 ? "Stores not found" : "Failed to load stores"
    );
  }
  return response.json();
}

export const fetchStore = async (slug: string): Promise<StoreData> => {
  const response = await fetch(`/api/stores/${slug}`);
  if (!response.ok) {
    throw new Error(
      response.status === 404 ? "Store not found" : "Failed to load store"
    );
  }
  const data = await response.json();
  return data.store;
};

export async function fetchProductStats(slug: string): Promise<number> {
  const res = await fetch(`/api/stores/${slug}/products`);
  if (!res.ok) return 0;
  const data = (await res.json()) as ProductsResponse;
  if (typeof data.count === "number") return data.count;
  if (Array.isArray(data.products)) return data.products.length;
  return 0;
}
