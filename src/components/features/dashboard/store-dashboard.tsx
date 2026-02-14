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
import { MetricCard } from "@/components/shared/common/metric-card";
import ProductManager from "@/components/shared/common/product-manager";
import { useDashboardParams } from "@/hooks/use-dashboard-params";

import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { fetchProductStats, fetchStoreAnalytics } from "@/lib/domains/stores/service";
import type { StoreData } from "@/lib/domains/stores/types";
import { useRequireAuth } from "@/lib/session";
import { StoreDashboardSkeleton } from "@/components/skeletons/store-dashboard-skeleton";
import { SalesChart } from "@/components/features/dashboard/overview/sales-chart";
import { RecentActivity } from "@/components/features/dashboard/overview/recent-activity";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/hooks/queries/use-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NotFoundState } from "@/components/shared/common/not-found-state";
import { RefreshButton } from "@/components/shared/common/refresh-button";

interface StoreDashboardProps {
  params: Promise<{ slug: string }>;
  initialStore?: { id: string; name: string; slug: string; ownerUserId: string; currency?: string } | null;
}

export default function StoreDashboard({ params, initialStore }: StoreDashboardProps) {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { slug, isLoading: paramsLoading } = useDashboardParams(params);

  const {
    data: store,
    error: storeError,
    isLoading: storeLoading,
  } = useStore(slug && !paramsLoading ? slug : null, {
    placeholderData: initialStore ? (initialStore as unknown as StoreData) : undefined,
  });

  // Use store from query or fallback to initialStore
  const displayStore = store || initialStore;

  const { data: productCount = 0, isLoading: productsLoading, refetch: refetchProductCount, isRefetching: isRefreshingProducts } = useQuery({
    queryKey: ["productCount", slug],
    queryFn: () => fetchProductStats(slug),
    enabled: !!store && !paramsLoading,
  });

  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics, isRefetching: isRefreshingAnalytics } = useQuery({
    queryKey: ["storeAnalytics", slug],
    queryFn: () => fetchStoreAnalytics(slug),
    enabled: !!store && !paramsLoading,
    staleTime: 0, // Always refetch analytics data
  });

  const handleRefresh = () => {
    refetchAnalytics();
    refetchProductCount();
    queryClient.invalidateQueries({ queryKey: ["storeAnalytics", slug] });
    queryClient.invalidateQueries({ queryKey: ["productCount", slug] });
  };

  const isRefreshing = isRefreshingAnalytics || isRefreshingProducts;

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
        <NotFoundState
          title="Store Not Found"
          message="The store you're looking for doesn't exist or has been removed."
          backHref="/dashboard/stores"
          backLabel="Back to Stores"
        />
      );
    }
    if (!isOwner) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-destructive">
                Access Denied
              </CardTitle>
              <CardDescription className="text-center">
                You don&apos;t have permission to manage this store.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Only the store owner can manage this store.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/stores">All Stores</Link>
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

  if (!store || !displayStore) return null;

  return (
    <DashboardLayout
      title={displayStore.name}
      desc="Overview of your store performance"
      breadcrumbs={[
        { label: "Stores", href: "/dashboard/stores" },
        { label: displayStore.name },
      ]}
      headerActions={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <RefreshButton
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          />
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href={`/stores/${displayStore.slug}`} target="_blank">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View Storefront
            </Link>
          </Button>
          <Button onClick={handleCreateProduct} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      }
    >
      <div className="space-y-8 pb-8">
        {/* Metric Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Revenue"
            value={formatCurrency(analytics?.revenue.total || 0, currency)}
            icon={DollarSign}
            color="amber"
          />
          <MetricCard
            label="Orders"
            value={`+${analytics?.orders.total || 0}`}
            icon={CreditCard}
            color="blue"
          />
          <MetricCard
            label="Customers"
            value={`+${analytics?.customers.total || 0}`}
            icon={Users}
            color="emerald"
          />
          <MetricCard
            label="Active Products"
            value={productCount}
            icon={Package}
            color="purple"
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
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
