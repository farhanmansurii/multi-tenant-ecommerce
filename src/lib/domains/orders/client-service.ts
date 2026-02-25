import { withBaseUrl } from "@/lib/utils/url";
import type { Order, OrderSummary } from "./types";
import { parseApiResponse } from "@/lib/query/api-response";

export interface OrdersResponse {
  orders: OrderSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
}

export async function fetchOrders(
  storeSlug: string,
  params?: OrderQueryParams
): Promise<OrdersResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.status) searchParams.set("status", params.status);
  if (params?.customerId) searchParams.set("customerId", params.customerId);

  const url = `/api/stores/${storeSlug}/orders${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await fetch(withBaseUrl(url));
  return parseApiResponse<OrdersResponse>(
    response,
    response.status === 404 ? "Orders not found" : "Failed to load orders",
  );
}

export async function fetchOrder(
  storeSlug: string,
  orderId: string
): Promise<Order> {
  const response = await fetch(
    withBaseUrl(`/api/stores/${storeSlug}/orders/${orderId}`)
  );
  const data = await parseApiResponse<{ order: Order }>(
    response,
    response.status === 404 ? "Order not found" : "Failed to load order",
  );
  return data.order;
}
