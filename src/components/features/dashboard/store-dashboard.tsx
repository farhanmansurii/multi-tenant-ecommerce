"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ShoppingBag,
  TagsIcon,
  Settings2,
  Package,
} from "lucide-react";

import { useRequireAuth } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductManager from "@/components/shared/common/product-manager";
import { useDashboardParams } from "@/hooks/use-dashboard-params";

import { useQuery } from "@tanstack/react-query";
import { fetchProductStats, fetchStore } from "@/lib/services/store-api";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { Loader } from "@/components/shared/common/loader";

interface StoreDashboardProps {
  params: Promise<{ slug: string }>;
}

export default function StoreDashboard({ params }: StoreDashboardProps) {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();
  const { slug, isLoading: paramsLoading } = useDashboardParams(params);

  const {
    data: store,
    error: storeError,
    isLoading: storeLoading,
  } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => fetchStore(slug),
    enabled: !!slug && !paramsLoading,
  });

  const { data: productCount = 0, isLoading: productsLoading } = useQuery({
    queryKey: ["productCount", slug],
    queryFn: () => fetchProductStats(slug),
    enabled: !!store && !paramsLoading,
  });

  const isOwner = store && user?.id === store.ownerId;

  const handleCreateProduct = () =>
    router.push(`/dashboard/stores/${slug}/products/new`);
  const handleEditStore = () =>
    router.push(`/dashboard/stores/${slug}/settings`);
  const handleManageCategories = () =>
    router.push(`/dashboard/stores/${slug}/categories`);

  // Loading states
  if (isPending || paramsLoading || storeLoading) {
    return <Loader text="Loading store dashboard..." className="min-h-screen" />;
  }

  // Authentication guard
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Authentication Required
            </CardTitle>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Store Not Found
            </h1>
            <p className="mb-6">
              The store you&apos;re looking for doesn&apos;t exist.
            </p>
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
              <CardTitle className="text-center text-red-600">
                Access Denied
              </CardTitle>
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

  console.log(store.name);

  return (
    <DashboardLayout
      title={store.name}
      desc="Manage your store and products"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Stores" },
        { label: store.name },
      ]}
      bottomActions={
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/stores/${store.slug}`)}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Storefront
          </Button>

          <Button variant="outline" onClick={handleManageCategories}>
            <TagsIcon className="mr-2 h-4 w-4" />
            Categories
          </Button>

          <Button variant="outline" onClick={handleEditStore}>
            <Settings2 className="mr-2 h-4 w-4" />
            Store Settings
          </Button>

          <Button onClick={handleCreateProduct}>
            <Package className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Products
            </CardTitle>
            <CardDescription>Total products currently listed</CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <Loader size={20} text="" className="h-12" />
            ) : (
              <p className="text-3xl font-semibold text-foreground">
                {productCount}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Store Status
            </CardTitle>
            <CardDescription>Status visible to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium capitalize text-foreground">
              {store.status}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Support Contact
            </CardTitle>
            <CardDescription>How customers reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-foreground">{store.contactEmail}</p>
            {store.contactPhone && (
              <p className="text-muted-foreground">{store.contactPhone}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Suspense>
        <ProductManager storeSlug={store.slug} />
      </Suspense>
    </DashboardLayout>
  );
}
