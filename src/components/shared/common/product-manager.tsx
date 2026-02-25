"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";

import ProductCard, { ProductTable } from "./product-manager/product-card";
import { ProductData, ProductViewMode } from "./product-manager/types";
import { QueryListSkeleton } from "@/lib/ui/query-skeleton";
import { useProducts } from "@/hooks/queries/use-products";
import { useDeleteProduct } from "@/hooks/mutations/use-product-mutations";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { EmptyState } from "@/components/shared/common/empty-state";
import { Filter, Grid3X3, List, Plus, Search } from "lucide-react";
import type { ProductData as DomainProductData } from "@/lib/domains/products/types";

interface ProductManagerProps {
  storeSlug: string;
  onProductsChange?: (products: ProductData[]) => void;
}

// Adapter function to convert domain ProductData to local ProductData
function adaptProduct(domainProduct: DomainProductData): ProductData {
  return {
    id: domainProduct.id,
    name: domainProduct.name,
    slug: domainProduct.slug,
    description: domainProduct.description,
    shortDescription: domainProduct.shortDescription ?? undefined,
    sku: domainProduct.sku ?? undefined,
    type: domainProduct.type,
    status: domainProduct.status,
    price: String(domainProduct.price ?? "0"),
    compareAtPrice: domainProduct.compareAtPrice ? String(domainProduct.compareAtPrice) : undefined,
    quantity: String(domainProduct.quantity ?? "0"),
    images: domainProduct.images,
    categories: domainProduct.categories,
    tags: domainProduct.tags,
    featured: domainProduct.featured,
    createdAt: domainProduct.createdAt instanceof Date ? domainProduct.createdAt.toISOString() : String(domainProduct.createdAt),
    updatedAt: domainProduct.updatedAt instanceof Date ? domainProduct.updatedAt.toISOString() : String(domainProduct.updatedAt),
  };
}

const ProductManager = ({ storeSlug, onProductsChange }: ProductManagerProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ProductViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productToDelete, setProductToDelete] = useState<ProductData | null>(null);

  const { data: domainProducts = [], isLoading, isError } = useProducts(storeSlug);
  const deleteProductMutation = useDeleteProduct(storeSlug);

  // Convert domain products to local format
  const products = useMemo(() => domainProducts.map(adaptProduct), [domainProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesStatus = statusFilter === "all" || product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const handleDeleteProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setProductToDelete(product);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.slug, {
        onSuccess: () => {
          toast.success("Product deleted successfully");
          setProductToDelete(null);
        },
      });
    }
  };

  // Handle products change callback
  useEffect(() => {
    if (products && onProductsChange) {
      onProductsChange(products);
    }
  }, [products, onProductsChange]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-32 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <QueryListSkeleton count={8} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <svg
            className="h-6 w-6 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Failed to load products</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading your products. Please try again.
        </p>
        <button
          onClick={() => queryClient.refetchQueries({ queryKey: ["products", storeSlug] })}
          className="text-sm text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card/80 p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Catalog</h2>
              <p className="text-sm text-muted-foreground">
                {products.length === 0
                  ? "No products yet"
                  : `${filteredProducts.length} of ${products.length} product${products.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => router.push(`/dashboard/stores/${storeSlug}/products/new`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[190px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <div className="inline-flex w-full overflow-hidden rounded-md border bg-background sm:w-auto">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  className="rounded-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  className="rounded-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[380px] rounded-xl border border-border/60 bg-card/70 p-4 sm:p-6">
        {products.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No products yet"
            description="Start building your catalog with your first product."
            action={{
              label: "Create First Product",
              onClick: () => router.push(`/dashboard/stores/${storeSlug}/products/new`),
              icon: Plus,
            }}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No products found"
            description="Try adjusting your search or filter criteria."
            variant="search"
            secondaryAction={
              searchQuery || statusFilter !== "all"
                ? {
                    label: "Clear filters",
                    onClick: () => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    },
                  }
                : undefined
            }
          />
        ) : viewMode === "list" ? (
          <ProductTable
            products={filteredProducts}
            onEdit={(p: ProductData) =>
              router.push(
                `/dashboard/stores/${storeSlug}/products/${p.slug || p.id}/edit`
              )
            }
            onDelete={handleDeleteProduct}
            onView={(p: ProductData) => {
              router.push(`/stores/${storeSlug}/products/${p.slug}`);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
            {filteredProducts.map((p: ProductData) => {
              if (!p || typeof p !== "object" || !p.id) {
                console.error("Invalid product data:", p);
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
                  onView={(cur: ProductData) => {
                    router.push(`/stores/${storeSlug}/products/${cur.slug}`);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent className="max-w-[95vw]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{productToDelete?.name}&quot; and remove all
              associated images. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
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
