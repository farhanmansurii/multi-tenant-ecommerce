"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, CheckCircle, Store, PackagePlus, Settings } from "lucide-react";

import { useRequireAuth } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductManager from "@/components/reusables/product-manager";

import { useQuery } from "@tanstack/react-query";

interface StoreDashboardProps {
  slug: string;

}

interface StoreData {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  status: "draft" | "active" | "suspended";
  contactEmail: string;
  contactPhone?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  count: number;
  products?: unknown[];
}

async function fetchStore(slug: string): Promise<StoreData> {
  const res = await fetch(`/api/stores/${slug}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("NOT_FOUND");
    throw new Error("STORE_FETCH_FAILED");
  }
  const data = await res.json();
  return data.store as StoreData;
}

async function fetchProductStats(slug: string): Promise<number> {
  const res = await fetch(`/api/stores/${slug}/products`);
  if (!res.ok) return 0;
  const data = (await res.json()) as ProductsResponse;
  if (typeof data.count === "number") return data.count;
  if (Array.isArray(data.products)) return data.products.length;
  return 0;
}

export default function StoreDashboard({ slug }: StoreDashboardProps) {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();

  const {
    data: store,
    error: storeError,
    isLoading: storeLoading,
  } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => fetchStore(slug),
    enabled: !!slug,
  });

  const {
    data: productCount = 0,
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ["products", slug],
    queryFn: () => fetchProductStats(slug),
    enabled: !!store, // only run if store is loaded
  });

  const isOwner = store && user?.id === store.ownerId;

  const handleCreateProduct = () => router.push(`/dashboard/stores/${slug}/products/new`);
  const handleEditStore = () => router.push(`/dashboard/stores/${slug}/settings`);

  // Loading states
  if (isPending || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading store dashboard...</p>
        </div>
      </div>
    );
  }

  // Authentication guard
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              You must be logged in to manage stores.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Errors
  if (storeError instanceof Error) {
    if (storeError.message === "NOT_FOUND") {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
            <p className="mb-6">The store you&apos;re looking for doesn&apos;t exist.</p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      );
    }
    if (!isOwner) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
              <CardDescription className="text-center">
                You don&apos;t have permission to manage this store.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Only the store owner can manage this store.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild>
                  <Link href={`/stores/${slug}`}>View Store</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  if (!store) return null;

  // Render dashboard
  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        {isOwner && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You are managing <span className="font-semibold">{store.name}</span>.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{store.name}</h1>
              <p className="text-muted-foreground">
                Monitor products, update settings, and keep your storefront in sync.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => router.push(`/stores/${store.slug}`)}>
                <Store className="mr-2 h-4 w-4" />
                View Storefront
              </Button>
              <Button variant="outline" onClick={handleEditStore}>
                <Settings className="mr-2 h-4 w-4" />
                Edit Store Settings
              </Button>
              <Button onClick={handleCreateProduct}>
                <PackagePlus className="mr-2 h-4 w-4" />
                Create Product
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Products</CardTitle>
                <CardDescription>Total products currently listed</CardDescription>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <p className="text-3xl font-semibold text-foreground">{productCount}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Store Status</CardTitle>
                <CardDescription>Status visible to customers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium capitalize text-foreground">{store.status}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Support Contact</CardTitle>
                <CardDescription>How customers reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-foreground">{store.contactEmail}</p>
                {store.contactPhone && <p className="text-muted-foreground">{store.contactPhone}</p>}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Catalogue</CardTitle>
            <CardDescription>
              Review, edit, and curate the products for this store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>

{JSON.stringify(store)}
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
