import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchCustomers, type CustomersResponse, type CustomerQueryParams } from "@/lib/domains/customers/client-service";
import { defaultQueryOptions } from "@/lib/query/defaults";

type UseCustomersOptions = Omit<
  UseQueryOptions<CustomersResponse, Error>,
  "queryKey" | "queryFn" | "enabled"
>;

export function useCustomers(
  storeSlug: string | null | undefined,
  search?: string,
  options?: UseCustomersOptions
) {
  const enabled = Boolean(storeSlug);

  return useQuery({
    queryKey: queryKeys.customers.all(storeSlug || "", search),
    queryFn: () => {
      if (!storeSlug) {
        throw new Error("Store slug is required");
      }
      return fetchCustomers(storeSlug, search ? { search } : undefined);
    },
    enabled,
    ...defaultQueryOptions,
    ...options,
  });
}
