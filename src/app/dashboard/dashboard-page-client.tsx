"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { gsap } from "gsap";
import {
  Store,
  Plus,
  ArrowRight,
  Search,
  LayoutGrid,
  LayoutList,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  ExternalLink,
  Settings,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import DashboardLayout from "@/components/shared/layout/dashboard-container";
import StoreCard from "@/components/features/dashboard/store-card";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

import { StoreData } from "@/lib/domains/stores/types";
import { fetchStores } from "@/lib/domains/stores/service";
import { useSessionContext } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { cn, formatDate } from "@/lib/utils";

const ViewSwitcher = ({
  viewMode,
  filteredStores,
}: {
  viewMode: "grid" | "list";
  filteredStores: StoreData[];
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const prevViewMode = useRef<"grid" | "list">(viewMode);

  useEffect(() => {
    if (prevViewMode.current !== viewMode && gridRef.current && listRef.current) {
      const oldView = prevViewMode.current === "grid" ? gridRef.current : listRef.current;
      const newView = viewMode === "grid" ? gridRef.current : listRef.current;

      const tl = gsap.timeline();
      tl.to(oldView, {
        opacity: 0,
        y: -4,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(oldView, { display: "none" });
        },
      })
        .set(newView, { display: "block", opacity: 0, y: 4 })
        .to(newView, {
          opacity: 1,
          y: 0,
          duration: 0.2,
          ease: "power2.out",
        });

      prevViewMode.current = viewMode;
    }
  }, [viewMode]);

  return (
    <>
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        style={{ display: viewMode === "grid" ? "grid" : "none" }}
      >
        {filteredStores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
      <div
        ref={listRef}
        className="flex flex-col gap-4"
        style={{ display: viewMode === "list" ? "flex" : "none" }}
      >
        {filteredStores.map((store) => (
          <StoreListItem key={store.id} store={store} />
        ))}
      </div>
    </>
  );
};

const StoreListItem = ({ store }: { store: StoreData }) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itemRef.current) {
      gsap.fromTo(
        itemRef.current,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      );
    }
  }, []);

  const statusVariant = {
    active: "success",
    draft: "warning",
    suspended: "destructive",
  } as const;

  return (
    <Link href={`/dashboard/stores/${store.slug}`} className="block">
      <div
        ref={itemRef}
        className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:-translate-y-1 cursor-pointer gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1 w-full">
          {store.logo ? (
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden shrink-0 border-2 border-border/50 bg-muted shadow-md group-hover:shadow-lg transition-shadow">
              <Image src={store.logo} alt={store.name} fill className="object-cover" sizes="56px" />
            </div>
          ) : (
            <div
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center shrink-0 border-2 border-border/50 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
              style={{
                background: store.primaryColor
                  ? `linear-gradient(135deg, ${store.primaryColor}20, ${store.primaryColor}30)`
                  : "hsl(var(--muted))",
                borderColor: store.primaryColor ? `${store.primaryColor}40` : "hsl(var(--border))",
              }}
            >
              <Store
                className="h-6 w-6 sm:h-7 sm:w-7"
                style={{ color: store.primaryColor || "hsl(var(--muted-foreground))" }}
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg text-foreground truncate group-hover:text-primary transition-colors">
                {store.name}
              </h3>
              <Badge
                variant={statusVariant[store.status as keyof typeof statusVariant] || "secondary"}
                className="text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 h-4 sm:h-5 font-semibold capitalize shadow-sm"
              >
                {store.status}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-70" />
                <span className="font-mono opacity-80 text-[11px] sm:text-xs">/{store.slug}</span>
              </div>
              <span className="hidden sm:inline opacity-50">•</span>
              <span className="text-[11px] sm:text-xs">{formatDate(store.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 mr-6">
          <CompactMetric
            label="Products"
            value={store.productCount || 0}
            icon={Package}
            color="purple"
            className="min-w-[100px]"
          />
          <CompactMetric
            label="Revenue"
            value={formatCurrency((store as any).revenue || 0, store.currency || "INR")}
            icon={TrendingUp}
            color="emerald"
            className="min-w-[120px]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            size="sm"
            variant="outline"
            className="hidden sm:flex rounded-lg h-9 font-medium"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/dashboard/stores/${store.slug}`;
            }}
          >
            Manage
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/stores/${store.slug}`} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/stores/${store.slug}/settings`} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/stores/${store.slug}`} target="_blank" className="cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" /> View Live
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Link>
  );
};

import { MetricCard } from "@/components/shared/common/metric-card";
import { CompactMetric } from "@/components/shared/common/compact-metric";
import { EmptyState } from "@/components/shared/common/empty-state";
import Image from "next/image";

const MetricsStrip = ({ stores, totalRevenue }: { stores: StoreData[]; totalRevenue: number }) => {
  const activeCount = stores.filter((s) => s.status === "active").length;
  const totalProducts = stores.reduce((acc, s) => acc + (s.productCount || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <MetricCard label="Total Stores" value={stores.length} icon={Store} color="blue" />
      <MetricCard label="Active Stores" value={activeCount} icon={TrendingUp} color="emerald" />
      <MetricCard label="Total Products" value={totalProducts} icon={Package} color="purple" />
      <MetricCard
        label="Total Revenue"
        value={formatCurrency(totalRevenue, "INR")}
        icon={Sparkles}
        color="amber"
      />
    </div>
  );
};

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${timeGreeting}, ${name}!`;
};

export default function DashboardPageClient() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("Welcome back");

  const { isAuthenticated, user, isPending } = useSessionContext();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (user?.name) {
      setGreeting(getGreeting(user.name.split(" ")[0]));
    }
  }, [user]);

  if (isError) toast.error((error as Error).message);

  const stores: StoreData[] = data?.stores ?? [];
  const totalRevenue = data?.totalRevenue ?? 0;
  const storeLimit = data
    ? {
        count: data.count,
        limit: data.limit,
        canCreateMore: data.canCreateMore,
      }
    : null;

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isPending || isLoading) {
    return (
      <DashboardLayout title="Dashboard" breadcrumbs={[{ label: "Dashboard" }]}>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to GumroadClone</h1>
          <p className="text-muted-foreground">Sign in to manage your digital empire.</p>
          <Button asChild size="lg" className="w-full rounded-lg">
            <Link href="/sign-in">
              Sign In <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      image={typeof user?.image === "string" ? user.image : undefined}
      title={greeting}
      desc="Here is what is happening with your stores today."
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }]}
      headerActions={
        storeLimit?.canCreateMore && (
          <Button asChild className="rounded-lg">
            <Link href="/dashboard/stores/new">
              <Plus className="h-4 w-4 mr-2" /> New Store
            </Link>
          </Button>
        )
      }
    >
      <div className="space-y-8">
        {stores.length > 0 && <MetricsStrip stores={stores} totalRevenue={totalRevenue} />}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search stores..."
              className="pl-10 h-10 rounded-lg border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-lg border border-border/50 backdrop-blur-sm w-full sm:w-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "h-8 px-3 rounded-md transition-all duration-200 flex-1 sm:flex-none",
                      viewMode === "list"
                        ? "bg-background text-foreground shadow-sm border border-border/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <LayoutList className="h-4 w-4 sm:mr-1.5" />
                    <span className="text-xs font-medium hidden sm:inline">List</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "h-8 px-3 rounded-md transition-all duration-200 flex-1 sm:flex-none",
                      viewMode === "grid"
                        ? "bg-background text-foreground shadow-sm border border-border/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4 sm:mr-1.5" />
                    <span className="text-xs font-medium hidden sm:inline">Grid</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="min-h-[400px]">
          {filteredStores.length === 0 ? (
            <EmptyState
              icon={Store}
              title={searchQuery ? "No stores found" : "No stores yet"}
              description={
                searchQuery
                  ? "Try adjusting your search terms or create a new store."
                  : "Get started by creating your first store and start selling your products."
              }
              variant={searchQuery ? "search" : "default"}
              action={
                !searchQuery
                  ? {
                      label: "Create your first store",
                      href: "/dashboard/stores/new",
                      icon: Plus,
                    }
                  : undefined
              }
              secondaryAction={
                searchQuery
                  ? {
                      label: "Clear search",
                      onClick: () => setSearchQuery(""),
                    }
                  : undefined
              }
            />
          ) : (
            <ViewSwitcher viewMode={viewMode} filteredStores={filteredStores} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
