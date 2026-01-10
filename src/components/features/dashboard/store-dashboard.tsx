'use client'
import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  CreditCard,
  Activity,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";


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

import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { fetchProductStats, fetchStore, fetchStoreAnalytics } from "@/lib/domains/stores/service";
import { useRequireAuth } from "@/lib/session";
import { StoreDashboardSkeleton } from "@/components/skeletons/store-dashboard-skeleton";
import { SalesChart } from "@/components/features/dashboard/overview/sales-chart";
import { RecentActivity } from "@/components/features/dashboard/overview/recent-activity";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface StoreDashboardProps {
  params: Promise<{ slug: string }>;
  initialStore?: { id: string; name: string; slug: string; ownerUserId: string; currency?: string } | null;
}

export default function StoreDashboard({ params, initialStore }: StoreDashboardProps) {
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
    placeholderData: initialStore || undefined,
    staleTime: 10 * 60 * 1000, // 10 minutes - store data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });

  // Use store from query or fallback to initialStore
  const displayStore = store || initialStore;

  const { data: productCount = 0, isLoading: productsLoading } = useQuery({
    queryKey: ["productCount", slug],
    queryFn: () => fetchProductStats(slug),
    enabled: !!store && !paramsLoading,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["storeAnalytics", slug],
    queryFn: () => fetchStoreAnalytics(slug),
    enabled: !!store && !paramsLoading,
    staleTime: 0, // Always refetch analytics data
  });

  const analytics = analyticsData?.analytics;
  const currency = analyticsData?.currency || displayStore?.currency || "INR";

  const isOwner = displayStore && user?.id === displayStore.ownerUserId;

  const handleCreateProduct = () =>
    router.push(`/dashboard/stores/${slug}/products/new`);

  // Loading states - only show loading if we don't have initial store data
  if (isPending || paramsLoading || (storeLoading && !initialStore) || analyticsLoading) {
    return (
      <DashboardLayout
        title="Store Dashboard"
        breadcrumbs={[
          { label: "Stores", href: "/dashboard/stores" },
          { label: displayStore?.name || slug || "Loading..." }
        ]}
        fullWidth
        disableAnimation={true}
      >
        <StoreDashboardSkeleton />
      </DashboardLayout>
    );
  }

  // Authentication guard
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-center">
              You must be logged in to manage stores.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full">
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

  return (
    <DashboardLayout
      title={displayStore.name}
      desc="Overview of your store performance"
      fullWidth
      breadcrumbs={[
        { label: "Stores", href: "/dashboard/stores" },
        { label: displayStore.name },
      ]}
      headerActions={
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href={`/stores/${displayStore.slug}`} target="_blank">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View Storefront
            </Link>
          </Button>
          <Button onClick={handleCreateProduct} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      }
    >
      <div className="space-y-8 pb-8">
        {/* Metric Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-sm bg-card/50 hover:bg-card transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {formatCurrency(analytics?.revenue.total || 0, currency)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {analytics?.revenue.growth === 0 ? (
                  <span className="text-muted-foreground">No change</span>
                ) : (
                  <span className={`flex items-center ${analytics?.revenue.growth > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {analytics?.revenue.growth > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {Math.abs(analytics?.revenue.growth || 0).toFixed(1)}%
                  </span>
                )}
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/50 hover:bg-card transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Orders
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">+{analytics?.orders.total || 0}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {analytics?.orders.growth === 0 ? (
                  <span className="text-muted-foreground">No change</span>
                ) : (
                  <span className={`flex items-center ${analytics?.orders.growth > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {analytics?.orders.growth > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {Math.abs(analytics?.orders.growth || 0).toFixed(1)}%
                  </span>
                )}
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/50 hover:bg-card transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">+{analytics?.customers.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total registered customers
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/50 hover:bg-card transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{productCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Products currently listed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <SalesChart data={analytics?.salesOverTime || []} currency={currency} />
          <RecentActivity data={analytics?.recentActivity || []} currency={currency} />
        </div>

        <Separator className="my-8" />

        {/* Products Section */}
        <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-xl" />}>
          <ProductManager storeSlug={displayStore.slug} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
