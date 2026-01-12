import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchOrder } from "@/lib/domains/orders/client-service";
import { defaultQueryOptions, longStaleTime } from "@/lib/query/defaults";
import type { Order } from "@/lib/domains/orders/types";

type UseOrderOptions = Omit<
  UseQueryOptions<Order, Error>,
  "queryKey" | "queryFn" | "enabled"
>;

export function useOrder(
  storeSlug: string | null | undefined,
  orderId: string | null | undefined,
  options?: UseOrderOptions
) {
  const enabled = Boolean(storeSlug && orderId);

  const { staleTime: _, ...restDefaults } = defaultQueryOptions;

  return useQuery({
    queryKey: queryKeys.orders.detail(storeSlug || "", orderId || ""),
    queryFn: () => {
      if (!storeSlug || !orderId) {
        throw new Error("Store slug and order ID are required");
      }
      return fetchOrder(storeSlug, orderId);
    },
    enabled,
    ...restDefaults,
    staleTime: longStaleTime,
    ...options,
  });
}
