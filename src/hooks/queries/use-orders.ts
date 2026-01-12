import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchOrders, type OrdersResponse, type OrderQueryParams } from "@/lib/domains/orders/client-service";
import { defaultQueryOptions } from "@/lib/query/defaults";

type UseOrdersOptions = Omit<
  UseQueryOptions<OrdersResponse, Error>,
  "queryKey" | "queryFn" | "enabled"
>;

export function useOrders(
  storeSlug: string | null | undefined,
  filters?: OrderQueryParams,
  options?: UseOrdersOptions
) {
  const enabled = Boolean(storeSlug);

  return useQuery({
    queryKey: queryKeys.orders.all(storeSlug || "", filters),
    queryFn: () => {
      if (!storeSlug) {
        throw new Error("Store slug is required");
      }
      return fetchOrders(storeSlug, filters);
    },
    enabled,
    ...defaultQueryOptions,
    ...options,
  });
}
