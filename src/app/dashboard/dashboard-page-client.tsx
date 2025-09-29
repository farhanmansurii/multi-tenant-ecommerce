"use client";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Store, Plus } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import StoreCard from "@/components/features/dashboard/store-card";
import { StoreData } from "@/lib/domains/stores/types";

import { Loader } from "@/components/shared/common/loader";
import { fetchStores } from "@/lib/domains/stores/service";
import { useSessionContext } from "@/lib/session";

export default function DashboardPageClient() {
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
    return <Loader text="Loading dashboard..." className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle>Access Required</CardTitle>
            <CardDescription>
              Please sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard"
      desc={`Welcome back, ${user?.name}`}
      image={
        typeof user?.image === "string" && user.image ? user.image : undefined
      }
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
      headerActions={
        storeLimit && (
          <div className="p-4 min-w-[220px] rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Store Usage</span>
              <span className="text-sm text-muted-foreground">
                {storeLimit.count}/{storeLimit.limit}
              </span>
            </div>
            <Progress
              className="h-2"
              value={(storeLimit.count / storeLimit.limit) * 100}
            />
          </div>
        )
      }
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">My Stores</h2>
          <Button asChild>
            <Link href="/dashboard/stores/new">
              <Plus className="h-4 w-4 mr-2" />
              New Store
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">No stores yet</CardTitle>
              <CardDescription className="mb-6">
                Create your first store to start selling online
              </CardDescription>
              <Button asChild>
                <Link href="/dashboard/stores/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Store
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {stores.map((store: StoreData) => (
              <StoreCard store={store} key={store.id} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
