"use client";

import React, { useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

export default function StorefrontView({ slug }: StorefrontViewProps) {
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [storeRes, productsRes] = await Promise.all([
          fetch(`/api/stores/${slug}`),
          fetch(`/api/stores/${slug}/products`),
        ]);

        if (!storeRes.ok) {
          const detail = await storeRes.json().catch(() => null);
          throw new Error(detail?.message || 'Failed to load store');
        }

        const storePayload = await storeRes.json();
        setStore(storePayload.store as StoreData);

        if (productsRes.ok) {
          const productsPayload = await productsRes.json();
          if (Array.isArray(productsPayload.products)) {
            setProducts(productsPayload.products as ProductData[]);
          }
        }
      } catch (err) {
        console.error('Error loading storefront:', err);
        setError(err instanceof Error ? err.message : 'Failed to load storefront');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading storefront...</span>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertTitle className="text-red-700">Store unavailable</AlertTitle>
          <AlertDescription className="text-red-600">
            {error || 'We could not find the store you were looking for.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header
        className="bg-gradient-to-br from-blue-50 via-white to-white border-b"
        style={store.primaryColor ? { borderColor: store.primaryColor } : undefined}
      >
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Storefront</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">{store.name}</h1>
          {store.tagline && <p className="mt-2 text-lg text-muted-foreground">{store.tagline}</p>}
          {store.description && <p className="mt-4 text-base text-muted-foreground">{store.description}</p>}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <Card className="border-dashed border-2 border-muted-foreground/30 bg-muted/10">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-muted-foreground">
                <Package className="h-5 w-5" />
                No products yet
              </CardTitle>
              <CardDescription>
                Please check back later. This store hasn&apos;t published products yet.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const price = Number(product.price ?? 0);
              const formattedPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
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
                    <p className="text-base font-semibold text-foreground">{formattedPrice}</p>
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
