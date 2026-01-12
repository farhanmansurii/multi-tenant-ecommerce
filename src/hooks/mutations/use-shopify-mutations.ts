import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ShopifyConfigData {
  domain: string;
  accessToken: string;
  apiVersion?: string;
  webhookSecret?: string;
  enabled?: boolean;
  settings?: {
    syncProducts: boolean;
    syncInventory: boolean;
    syncOrders: boolean;
    autoPublish: boolean;
  };
}

export function useShopifyConfig(storeSlug: string | null) {
  return useQuery({
    queryKey: ["shopify-config", storeSlug],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeSlug}/shopify/config`);
      if (!response.ok) {
        throw new Error("Failed to fetch Shopify config");
      }
      return response.json();
    },
    enabled: !!storeSlug,
  });
}

export function useUpdateShopifyConfig(storeSlug: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ShopifyConfigData) => {
      const response = await fetch(`/api/stores/${storeSlug}/shopify/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update Shopify config");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify-config", storeSlug] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update Shopify configuration");
    },
  });
}

export function useToggleShopifyIntegration(storeSlug: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch(`/api/stores/${storeSlug}/shopify/config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle integration");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify-config", storeSlug] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update integration status");
    },
  });
}
