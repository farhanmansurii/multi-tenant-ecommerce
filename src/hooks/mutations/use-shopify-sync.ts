import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SyncOptions {
  type: "products" | "inventory" | "all";
}

export function useShopifySync(storeSlug: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: SyncOptions) => {
      const response = await fetch(`/api/stores/${storeSlug}/shopify/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Sync failed");
      }

      return response.json();
    },
    onSuccess: (result, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["shopify-config", storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["products", storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["analytics", storeSlug] });

      if (variables.type === "products" || variables.type === "all") {
        toast.success(`Products synced successfully`);
      } else if (variables.type === "inventory") {
        toast.success(`Inventory synced successfully`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Sync failed");
    },
  });
}
