import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { createCategory, updateCategory, deleteCategory } from "@/lib/domains/products/category-service";
import type { Category } from "@/lib/db/schema";

interface CategoryFormData {
  name: string;
  description?: string;
  image?: string;
  color?: string;
  sortOrder?: number;
}

export function useCreateCategory(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryFormData) => createCategory(storeSlug, data),
    onSuccess: (newCategory: Category) => {
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.all(storeSlug),
        (old) => (old ? [...old, newCategory] : [newCategory])
      );
      queryClient.refetchQueries({ queryKey: queryKeys.categories.all(storeSlug) });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}

export function useUpdateCategory(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: CategoryFormData }) =>
      updateCategory(storeSlug, categoryId, data),
    onSuccess: (updatedCategory: Category) => {
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.all(storeSlug),
        (old) =>
          old?.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)) || []
      );
      queryClient.refetchQueries({ queryKey: queryKeys.categories.all(storeSlug) });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}

export function useDeleteCategory(storeSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(storeSlug, categoryId),
    onSuccess: (_, categoryId) => {
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.all(storeSlug),
        (old) => old?.filter((cat) => cat.id !== categoryId) || []
      );
      queryClient.refetchQueries({ queryKey: queryKeys.categories.all(storeSlug) });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });
}
