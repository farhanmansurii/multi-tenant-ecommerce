"use client";

import { Button } from "@/components/ui/button";
import { PageCard } from "@/components/shared/layout/page-card";
import { Progress } from "@/components/ui/progress";
import { Store, Plus, ArrowRight, TrendingUp, Package, Users } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import StoreCard from "@/components/features/dashboard/store-card";
import { StoreData } from "@/lib/domains/stores/types";
import { fetchStores } from "@/lib/domains/stores/service";
import { useSessionContext } from "@/lib/session";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

export default function StoresPage() {
  const { isAuthenticated, user, isPending } = useSessionContext();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    enabled: isAuthenticated,
  });

  if (isError) {
    toast.error((error as Error).message);
  }

  const stores: StoreData[] = data?.stores ?? [];
  const storeLimit = data
    ? {
      count: data.count,
      limit: data.limit,
      canCreateMore: data.canCreateMore,
    }
    : null;

  if (isPending) {
    return (
      <DashboardLayout
        title="My Stores"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Stores" },
        ]}
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-muted/20">
        <PageCard
          title="Welcome Back"
          description="Sign in to manage your stores and view analytics"
          variant="elevated"
          className="w-full max-w-md"
          footer={
            <Button asChild className="w-full h-11 text-base">
              <Link href="/sign-in">Sign In to Continue</Link>
            </Button>
          }
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
        </PageCard>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="My Stores"
      desc="All your stores in one place"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Stores" },
      ]}
      headerActions={
        <div className="flex items-center gap-4">
          {storeLimit && (
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg border bg-card/50">
              <span className="text-sm text-muted-foreground">Usage:</span>
              <Progress
                className="w-24 h-2"
                value={(storeLimit.count / storeLimit.limit) * 100}
              />
              <span className="text-sm font-medium">
                {storeLimit.count}/{storeLimit.limit}
              </span>
            </div>
          )}
          <Button asChild>
            <Link href="/dashboard/stores/new">
              <Plus className="h-4 w-4 mr-2" />
              New Store
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {isLoading ? (
          <DashboardSkeleton />
        ) : stores.length === 0 ? (
          <PageCard
            variant="outlined"
            className="border-dashed border-2 bg-muted/5"
          >
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Store className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No stores created yet</h3>
              <p className="text-muted-foreground max-w-sm mb-8 text-lg">
                Get started by creating your first online store. It only takes a few minutes.
              </p>
              <Button asChild size="lg" className="h-12 px-8">
                <Link href="/dashboard/stores/new">
                  Create Your First Store
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </PageCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store: StoreData) => (
              <StoreCard store={store} key={store.id} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
