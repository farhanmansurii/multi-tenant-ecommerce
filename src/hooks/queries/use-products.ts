import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchProducts } from "@/lib/domains/products/service";
import { defaultQueryOptions } from "@/lib/query/defaults";
import type { ProductData } from "@/lib/domains/products/types";

type UseProductsOptions = Omit<
  UseQueryOptions<ProductData[], Error>,
  "queryKey" | "queryFn" | "enabled"
>;

export function useProducts(
  storeSlug: string | null | undefined,
  options?: UseProductsOptions
) {
  const enabled = Boolean(storeSlug);

  return useQuery({
    queryKey: queryKeys.products.all(storeSlug || ""),
    queryFn: () => {
      if (!storeSlug) {
        throw new Error("Store slug is required");
      }
      return fetchProducts(storeSlug);
    },
    enabled,
    ...defaultQueryOptions,
    ...options,
  });
}
