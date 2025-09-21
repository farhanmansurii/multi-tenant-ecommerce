"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useRequireAuth } from "@/lib/session-context";
import { UploadedFile } from "@/lib/types/product";
import {
  productFormSchema,
  ProductFormValues,
} from "@/lib/validations/product-form";
import {
  parseNumberOrUndefined,
  formatProductFormData,
} from "@/lib/utils/product-formatters";
import {
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/services/product-api";
import { fetchStore } from "@/lib/services/store-api";
interface UseProductFormProps {
  mode: "create" | "edit";
  storeSlug: string;
  productSlug?: string;
}

export const useProductForm = ({
  mode,
  storeSlug,
  productSlug,
}: UseProductFormProps) => {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const {
    data: store,
    isLoading: storeLoading,
    error: storeError,
  } = useQuery({
    queryKey: ["store", storeSlug],
    queryFn: () => fetchStore(storeSlug),
    enabled: !!storeSlug,
    retry: 1,
  });

  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useQuery({
    queryKey: ["product", storeSlug, productSlug],
    queryFn: () => fetchProduct(storeSlug, productSlug!),
    enabled: mode === "edit" && !!storeSlug && !!productSlug,
    retry: 1,
  });

  // Check permissions
  const isOwner = store && user && store.ownerId === user.id;

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      sku: "",
      type: "physical",
      status: "draft",
      price: 0,
      compareAtPrice: undefined,
      quantity: 0,
      requiresShipping: true,
      taxable: true,
      trackQuantity: true,
      allowBackorder: false,
      featured: false,
      categories: [],
      tags: [],
    },
  });

  // Reset form when product data changes (edit mode only)
  useEffect(() => {
    if (mode === "edit" && product) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        sku: product.sku || "",
        type: product.type || "physical",
        status: product.status || "draft",
        price: parseNumberOrUndefined(product.price) || 0,
        compareAtPrice: parseNumberOrUndefined(product.compareAtPrice),
        quantity: parseNumberOrUndefined(product.quantity) || 0,
        requiresShipping: product.requiresShipping ?? true,
        taxable: product.taxable ?? true,
        trackQuantity: product.trackQuantity ?? true,
        allowBackorder: product.allowBackorder ?? false,
        featured: product.featured ?? false,
        categories: Array.isArray(product.categories) ? product.categories : [],
        tags: Array.isArray(product.tags) ? product.tags : [],
      });

      // Set uploaded files from existing product images
      if (product.images?.length) {
        setUploadedFiles(
          product.images.map((image, index) => {
            if (typeof image === "string") {
              return {
                url: image,
                name: `image-${index + 1}`,
                size: 0,
              };
            } else if (image && typeof image === "object" && "url" in image) {
              return {
                url: image.url,
                name:
                  "alt" in image && typeof image.alt === "string" && image.alt
                    ? image.alt
                    : `image-${index + 1}`,
                size: 0,
              };
            } else {
              return {
                url: "",
                name: `image-${index + 1}`,
                size: 0,
              };
            }
          })
        );
      }
    }
  }, [mode, product, form]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: ProductFormValues) =>
      createProduct(storeSlug, formatProductFormData(data, uploadedFiles)),
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["store", storeSlug] });
      router.push(`/dashboard/stores/${storeSlug}`);
    },
    onError: (error: Error) => {
      console.error("Error creating product:", error);
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormValues) =>
      updateProduct(
        storeSlug,
        product!.slug,
        formatProductFormData(data, uploadedFiles)
      ),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["product", storeSlug, productSlug],
      });
      queryClient.invalidateQueries({ queryKey: ["store", storeSlug] });
      router.push(`/dashboard/stores/${storeSlug}`);
    },
    onError: (error: Error) => {
      console.error("Error updating product:", error);
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(storeSlug, product!.slug),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["store", storeSlug] });
      router.push(`/dashboard/stores/${storeSlug}`);
    },
    onError: (error: Error) => {
      console.error("Error deleting product:", error);
      toast.error(error.message);
    },
  });

  // Handlers
  const onSubmit = useCallback(
    (values: ProductFormValues) => {
      if (mode === "create") {
        createMutation.mutate(values);
      } else {
        updateMutation.mutate(values);
      }
    },
    [mode, createMutation, updateMutation]
  );

  const handleDelete = useCallback(() => {
    const confirmed = window.confirm(
      "Deleting this product will remove it from your store. This action cannot be undone. Continue?"
    );

    if (confirmed) {
      deleteMutation.mutate();
    }
  }, [deleteMutation]);

  // Determine which mutation to use based on mode
  const currentMutation = mode === "create" ? createMutation : updateMutation;

  return {
    // State
    isAuthenticated,
    isPending,
    store,
    product,
    isOwner,
    uploadedFiles,
    setUploadedFiles,
    mode,

    // Loading states
    storeLoading,
    productLoading,

    // Errors
    storeError,
    productError,

    // Form
    form,
    onSubmit,

    // Mutations
    currentMutation,
    deleteMutation,
    handleDelete,
  };
};
