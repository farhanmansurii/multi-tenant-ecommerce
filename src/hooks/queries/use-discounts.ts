import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchDiscounts } from "@/lib/domains/discounts/client-service";
import { defaultQueryOptions } from "@/lib/query/defaults";
import type { Discount } from "@/lib/db/schema/ecommerce/discounts";

type UseDiscountsOptions = Omit<
  UseQueryOptions<Discount[], Error>,
  "queryKey" | "queryFn" | "enabled"
>;

export function useDiscounts(
  storeSlug: string | null | undefined,
  options?: UseDiscountsOptions
) {
  const enabled = Boolean(storeSlug);

  return useQuery({
    queryKey: queryKeys.discounts.all(storeSlug || ""),
    queryFn: () => {
      if (!storeSlug) {
        throw new Error("Store slug is required");
      }
      return fetchDiscounts(storeSlug);
    },
    enabled,
    ...defaultQueryOptions,
    ...options,
  });
}
