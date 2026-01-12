import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { createProduct, updateProduct, deleteProduct } from "@/lib/domains/products/service";
import { invalidateProductQueries } from "@/lib/query/utils";
import type { ProductInput, ProductData } from "@/lib/domains/products/types";

export function useCreateProduct(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ProductInput>) => createProduct(storeSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(storeSlug) });
      invalidateProductQueries(queryClient, storeSlug);
      queryClient.refetchQueries({ queryKey: queryKeys.products.all(storeSlug) });
      toast.success("Product created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
    },
  });
}

export function useUpdateProduct(storeSlug: string, productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ProductInput>) => updateProduct(storeSlug, productSlug, data),
    onSuccess: (product: ProductData) => {
      queryClient.setQueryData(queryKeys.products.detail(storeSlug, productSlug), product);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(storeSlug) });
      invalidateProductQueries(queryClient, storeSlug, productSlug);
      queryClient.refetchQueries({ queryKey: queryKeys.products.all(storeSlug) });
      toast.success("Product updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
    },
  });
}

export function useDeleteProduct(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productSlug: string) => deleteProduct(storeSlug, productSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(storeSlug) });
      invalidateProductQueries(queryClient, storeSlug);
      queryClient.refetchQueries({ queryKey: queryKeys.products.all(storeSlug) });
      toast.success("Product deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });
}
