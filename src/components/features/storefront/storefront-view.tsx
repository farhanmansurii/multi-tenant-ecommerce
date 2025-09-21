"use client";

import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HeroSection } from "./hero-section";
import { fetchCategories } from "@/lib/services/category-api";
import { Loader } from "@/components/shared/common/loader";

interface StorefrontViewProps {
  slug: string;
}

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string | null;
  primaryColor?: string | null;
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: string;
  images: Array<{ id: string; url: string; alt: string }>;
  status: string;
}

async function fetchStore(slug: string): Promise<StoreData> {
  const res = await fetch(`/api/stores/${slug}`);
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.message || "Failed to load store");
  }
  const payload = await res.json();
  return payload.store as StoreData;
}

async function fetchProducts(slug: string): Promise<ProductData[]> {
  const res = await fetch(`/api/stores/${slug}/products`);
  if (!res.ok) return [];
  const payload = await res.json();
  return Array.isArray(payload.products)
    ? (payload.products as ProductData[])
    : [];
}

export default function StorefrontView({ slug }: StorefrontViewProps) {
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

  if (loading) {
    return <Loader text="Loading storefront..." className="min-h-screen" />;
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Store unavailable</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "We could not find the store you were looking for."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Categories */}
      <HeroSection
        storeName={store.name}
        storeDescription={store.description}
        categories={categories}
        featuredProducts={products.slice(0, 3).map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url,
        }))}
        showCategories={categories.length > 0}
        heroTitle={store.tagline || `Welcome to ${store.name}`}
        heroSubtitle={store.description}
        ctaText="Shop Now"
        ctaLink="#products"
      />

      <main id="products" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-muted-foreground">
                <Package className="h-5 w-5" />
                No products yet
              </CardTitle>
              <CardDescription>
                Please check back later. This store hasn&apos;t published
                products yet.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const price = Number(product.price ?? 0);
              const formattedPrice = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(Number.isFinite(price) ? price : 0);

              const image = product.images?.[0];

              return (
                <Card key={product.id} className="h-full">
                  {image ? (
                    <div className="aspect-square w-full overflow-hidden bg-muted">
                      <img
                        src={image.url}
                        alt={image.alt || product.name}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square w-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base font-semibold">{formattedPrice}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
