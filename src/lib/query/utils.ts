import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";

export function invalidateStoreQueries(
  queryClient: QueryClient,
  storeSlug: string
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(storeSlug) });
  queryClient.invalidateQueries({ queryKey: queryKeys.products.all(storeSlug) });
  queryClient.invalidateQueries({ queryKey: queryKeys.products.count(storeSlug) });
  queryClient.invalidateQueries({ queryKey: queryKeys.categories.all(storeSlug) });
  queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(storeSlug) });
  queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(storeSlug) });
  queryClient.invalidateQueries({ queryKey: queryKeys.discounts.all(storeSlug) });
}

export function refetchStoreQueries(
  queryClient: QueryClient,
  storeSlug: string
) {
  queryClient.refetchQueries({ queryKey: queryKeys.stores.detail(storeSlug) });
  queryClient.refetchQueries({ queryKey: queryKeys.products.all(storeSlug) });
  queryClient.refetchQueries({ queryKey: queryKeys.categories.all(storeSlug) });
}

export function invalidateProductQueries(
  queryClient: QueryClient,
  storeSlug: string,
  productSlug?: string
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.products.all(storeSlug) });
  queryClient.invalidateQueries({ queryKey: queryKeys.products.count(storeSlug) });
  if (productSlug) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.products.detail(storeSlug, productSlug),
    });
  }
}

export function invalidateOrderQueries(
  queryClient: QueryClient,
  storeSlug: string,
  orderId?: string
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(storeSlug) });
  if (orderId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.orders.detail(storeSlug, orderId),
    });
  }
}
