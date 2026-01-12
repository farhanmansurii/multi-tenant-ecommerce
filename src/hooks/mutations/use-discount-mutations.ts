import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import type { Discount } from "@/lib/db/schema/ecommerce/discounts";
import { withBaseUrl } from "@/lib/utils/url";

interface DiscountFormValues {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  startsAt?: string;
  expiresAt?: string;
  description?: string;
  applicableTo?: { type: "all" | "products" | "categories"; ids?: string[] };
}

export function useCreateDiscount(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DiscountFormValues) => {
      const payload = {
        ...data,
        value: data.type === "percentage" ? data.value : data.value * 100,
        minOrderAmount: data.minOrderAmount ? data.minOrderAmount * 100 : null,
        maxDiscountAmount: data.maxDiscountAmount ? data.maxDiscountAmount * 100 : null,
        usageLimit: data.usageLimit || null,
        startsAt: data.startsAt || null,
        expiresAt: data.expiresAt || null,
        description: data.description || null,
      };

      const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/discounts`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to create discount");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discounts.all(storeSlug) });
      queryClient.refetchQueries({ queryKey: queryKeys.discounts.all(storeSlug) });
      toast.success("Discount created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create discount");
    },
  });
}

export function useUpdateDiscount(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ discountId, data }: { discountId: string; data: DiscountFormValues }) => {
      const payload = {
        ...data,
        value: data.type === "percentage" ? data.value : data.value * 100,
        minOrderAmount: data.minOrderAmount ? data.minOrderAmount * 100 : null,
        maxDiscountAmount: data.maxDiscountAmount ? data.maxDiscountAmount * 100 : null,
        usageLimit: data.usageLimit || null,
        startsAt: data.startsAt || null,
        expiresAt: data.expiresAt || null,
        description: data.description || null,
      };

      const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/discounts`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: discountId, ...payload }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to update discount");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discounts.all(storeSlug) });
      queryClient.refetchQueries({ queryKey: queryKeys.discounts.all(storeSlug) });
      toast.success("Discount updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update discount");
    },
  });
}

export function useDeleteDiscount(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discountId: string) => {
      const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/discounts`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: discountId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to delete discount");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discounts.all(storeSlug) });
      queryClient.refetchQueries({ queryKey: queryKeys.discounts.all(storeSlug) });
      toast.success("Discount deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete discount");
    },
  });
}

export function useToggleDiscountActive(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discount: { id: string; isActive: boolean }) => {
      const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/discounts`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: discount.id, isActive: !discount.isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to toggle discount");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discounts.all(storeSlug) });
      queryClient.refetchQueries({ queryKey: queryKeys.discounts.all(storeSlug) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to toggle discount");
    },
  });
}
