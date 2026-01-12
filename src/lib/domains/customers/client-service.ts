import { withBaseUrl } from "@/lib/utils/url";
import type { CustomerSummary } from "./types";

export interface CustomersResponse {
  customers: CustomerSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function fetchCustomers(
  storeSlug: string,
  params?: CustomerQueryParams
): Promise<CustomersResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.search) searchParams.set("search", params.search);

  const url = `/api/stores/${storeSlug}/customers${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await fetch(withBaseUrl(url));

  if (!response.ok) {
    throw new Error(
      response.status === 404 ? "Customers not found" : "Failed to load customers"
    );
  }

  return response.json();
}
