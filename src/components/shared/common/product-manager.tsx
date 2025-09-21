"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import ProductCard, { ProductTable } from "./product-manager/product-card";
import ProductEmptyState from "./product-manager/product-empty-state";
import ProductToolbar from "./product-manager/product-toolbar";
import { ProductData, ProductViewMode } from "./product-manager/types";
import { Loader } from "@/components/shared/common/loader";

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
  const [viewMode, setViewMode] = useState<ProductViewMode>("grid");

  const { data: products = [], isLoading, isError } = useQuery<ProductData[], Error>({
    queryKey: ["products", storeSlug],
    queryFn: () => fetchProducts(storeSlug),
  });

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
          onDelete={() => {}}
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
                onDelete={() => {}}
                onView={(cur: ProductData) => console.log("View product:", cur)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductManager;
