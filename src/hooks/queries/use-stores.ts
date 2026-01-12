import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchStores } from "@/lib/domains/stores/service";
import { defaultQueryOptions } from "@/lib/query/defaults";
import type { StoreData } from "@/lib/domains/stores/types";

interface StoresResponse {
  stores: StoreData[];
  count: number;
  limit: number;
  canCreateMore: boolean;
  totalRevenue: number;
}

type UseStoresOptions = Omit<
  UseQueryOptions<StoresResponse, Error>,
  "queryKey" | "queryFn"
>;

export function useStores(options?: UseStoresOptions) {
  return useQuery({
    queryKey: queryKeys.stores.all,
    queryFn: fetchStores,
    ...defaultQueryOptions,
    ...options,
  });
}
