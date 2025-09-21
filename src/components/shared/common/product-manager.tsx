"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import ProductCard, { ProductTable } from "./product-manager/product-card";
import ProductEmptyState from "./product-manager/product-empty-state";
import ProductToolbar from "./product-manager/product-toolbar";
import { ProductData, ProductViewMode } from "./product-manager/types";
import { Loader } from "@/components/shared/common/loader";
import { deleteProduct } from "@/lib/services/product-api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductManagerProps {
  storeSlug: string;
  onProductsChange?: (products: ProductData[]) => void;
}

async function fetchProducts(storeSlug: string): Promise<ProductData[]> {
  const res = await fetch(`/api/stores/${storeSlug}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data: { products?: ProductData[] } = await res.json();
  console.log('Fetched products data:', data);
  const products = Array.isArray(data.products) ? data.products : [];
  console.log('Processed products:', products);
  return products;
}

const ProductManager = ({ storeSlug, onProductsChange }: ProductManagerProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ProductViewMode>("grid");
  const [productToDelete, setProductToDelete] = useState<ProductData | null>(null);

  const { data: products = [], isLoading, isError } = useQuery<ProductData[], Error>({
    queryKey: ["products", storeSlug],
    queryFn: () => fetchProducts(storeSlug),
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (product: ProductData) => deleteProduct(storeSlug, product.slug || product.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", storeSlug] });
      toast.success("Product deleted successfully");
      setProductToDelete(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    },
  });

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete(product);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
    }
  };

  // Handle products change callback
  useEffect(() => {
    if (products && onProductsChange) {
      onProductsChange(products);
    }
  }, [products, onProductsChange]);

  if (isLoading) {
    return <Loader text="Loading products..." className="py-8" />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-8 text-red-500">
        Failed to load products
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductToolbar
        productCount={products.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateProduct={() =>
          router.push(`/dashboard/stores/${storeSlug}/products/new`)
        }
      />

      {products.length === 0 ? (
        <ProductEmptyState
          onCreateProduct={() =>
            router.push(`/dashboard/stores/${storeSlug}/products/new`)
          }
        />
      ) : viewMode === "list" ? (
        <ProductTable
          products={products}
          onEdit={(p: ProductData) =>
            router.push(
              `/dashboard/stores/${storeSlug}/products/${p.slug || p.id}/edit`
            )
          }
          onDelete={handleDeleteProduct}
          onView={(p: ProductData) => console.log("View product:", p)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p: ProductData) => {
            // Ensure p is a valid ProductData object
            if (!p || typeof p !== 'object' || !p.id) {
              console.error('Invalid product data:', p);
              return null;
            }

            return (
              <ProductCard
                key={p.id}
                product={p}
                viewMode={viewMode}
                onEdit={() =>
                  router.push(
                    `/dashboard/stores/${storeSlug}/products/${p.slug || p.id}/edit`
                  )
                }
                onDelete={handleDeleteProduct}
                onView={(cur: ProductData) => console.log("View product:", cur)}
              />
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product &quot;{productToDelete?.name}&quot; and remove all associated images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManager;
