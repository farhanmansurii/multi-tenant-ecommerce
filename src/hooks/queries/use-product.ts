import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchProduct } from "@/lib/domains/products/service";
import { defaultQueryOptions, longStaleTime } from "@/lib/query/defaults";
import type { ProductData } from "@/lib/domains/products/types";

type UseProductOptions = Omit<
  UseQueryOptions<ProductData, Error>,
  "queryKey" | "queryFn" | "enabled"
>;

export function useProduct(
  storeSlug: string | null | undefined,
  productSlug: string | null | undefined,
  options?: UseProductOptions
) {
  const enabled = Boolean(storeSlug && productSlug);
  const { staleTime: _, ...restDefaults } = defaultQueryOptions;
  return useQuery({
    queryKey: queryKeys.products.detail(storeSlug || "", productSlug || ""),
    queryFn: () => {
      if (!storeSlug || !productSlug) {
        throw new Error("Store slug and product slug are required");
      }
      return fetchProduct(storeSlug, productSlug);
    },
    enabled,
    ...restDefaults,
    staleTime: longStaleTime,
    ...options,
  });
}
