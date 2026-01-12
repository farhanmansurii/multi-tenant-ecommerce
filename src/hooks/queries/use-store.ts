import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchStore } from "@/lib/domains/stores/service";
import { defaultQueryOptions, longStaleTime } from "@/lib/query/defaults";
import type { StoreData } from "@/lib/domains/stores/types";

type UseStoreOptions = Omit<
  UseQueryOptions<StoreData, Error>,
  "queryKey" | "queryFn" | "enabled"
>;

export function useStore(
  slug: string | null | undefined,
  options?: UseStoreOptions
) {
  const enabled = Boolean(slug);
  const { staleTime: _, ...restDefaults } = defaultQueryOptions;
  return useQuery({
    queryKey: queryKeys.stores.detail(slug || ""),
    queryFn: () => {
      if (!slug) {
        throw new Error("Store slug is required");
      }
      return fetchStore(slug);
    },
    enabled,
    ...restDefaults,
    staleTime: longStaleTime,
    ...options,
  });
}
