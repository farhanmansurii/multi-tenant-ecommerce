"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { fetchCategories } from "@/lib/services/category-api";
import { Loader } from "@/components/shared/common/loader";
import { fetchProducts } from "@/lib/services/product-api";
import { StoreFrontHeader } from "./storefront-reusables/navbar";
import StoreFrontFooter from "./storefront-reusables/footer";
import { fetchStore } from "@/lib/services/store-api";

interface StorefrontViewProps {
  slug: string;
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: string;
  images: Array<{ id: string; url: string; alt: string }>;
  status: string;
}

export default function StorefrontView({ slug }: StorefrontViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);

  const {
    data: store,
    isLoading: storeLoading,
    error: storeError,
  } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => fetchStore(slug),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", slug],
    queryFn: () => fetchProducts(slug),
    enabled: !!store,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", slug],
    queryFn: () => fetchCategories(slug),
    enabled: !!store,
  });

  const loading = storeLoading || productsLoading || categoriesLoading;
  const error = storeError;

  // Event handlers
  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    // Implement search functionality
  };

  const handleCartClick = () => {
    console.log("Cart clicked");
    // Implement cart functionality
  };

  const handleAccountClick = () => {
    console.log("Account clicked");
    // Implement account functionality
  };

  const handleProductClick = (productId: string) => {
    console.log("Product clicked:", productId);
    // Navigate to product detail page
  };

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
    setCartItemCount((prev) => prev + 1);
    // Implement add to cart functionality
  };

  const handleAddToWishlist = (productId: string) => {
    console.log("Add to wishlist:", productId);
    // Implement add to wishlist functionality
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  if (loading) {
    return <Loader text="Loading storefront..." className="min-h-screen" />;
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-red-100 p-4">
              <svg
                className="h-8 w-8 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Store unavailable</h1>
            <p className="text-gray-600">
              {error instanceof Error
                ? error.message
                : "We could not find the store you were looking for."}
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen ">
      <StoreFrontHeader storeData={store} />
      <div className="w-full aspect-video">hi</div>
      <StoreFrontFooter store={store} />
    </div>
  );
}
