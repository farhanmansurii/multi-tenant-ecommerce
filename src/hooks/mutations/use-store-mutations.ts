import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { createStore, updateStore } from "@/lib/domains/stores/service";
import type { StoreFormPayload, StoreData } from "@/lib/domains/stores/types";
import { invalidateStoreQueries, refetchStoreQueries } from "@/lib/query/utils";

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreFormPayload) => createStore(data),
    onSuccess: (store: StoreData) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.refetchQueries({ queryKey: queryKeys.stores.all });
      toast.success("Store created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create store");
    },
  });
}

export function useUpdateStore(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreFormPayload) => updateStore(storeSlug, data),
    onSuccess: (store: StoreData) => {
      queryClient.setQueryData(queryKeys.stores.detail(storeSlug), store);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.refetchQueries({ queryKey: queryKeys.stores.all });
      invalidateStoreQueries(queryClient, storeSlug);
      toast.success("Store updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update store");
    },
  });
}
