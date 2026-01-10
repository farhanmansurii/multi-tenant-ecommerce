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
  MoreHorizontal,
  Package,
  ExternalLink,
  Settings,
  TrendingUp,
  AlertCircle,
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import DashboardLayout from "@/components/shared/layout/dashboard-container";
import StoreCard from "@/components/features/dashboard/store-card";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

import { StoreData } from "@/lib/domains/stores/types";
import { fetchStores } from "@/lib/domains/stores/service";
import { useSessionContext } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { cn, formatDate } from "@/lib/utils";

const ViewSwitcher = ({ viewMode, filteredStores }: { viewMode: "grid" | "list"; filteredStores: StoreData[] }) => {
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
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        style={{ display: viewMode === "grid" ? "grid" : "none" }}
      >
        {filteredStores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
      <div
        ref={listRef}
        className="flex flex-col gap-3"
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
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, []);

  const statusColors = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    draft: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    suspended: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  }[store.status] || "bg-muted text-muted-foreground";

  return (
    <div
      ref={itemRef}
      className="group flex items-center justify-between p-4 bg-card border border-border/50 hover:border-border/70 rounded-lg transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border border-white/5 shadow-sm"
          style={{ background: store.primaryColor ? `${store.primaryColor}20` : "hsl(var(--muted))" }}
        >
          <Store className="h-5 w-5" style={{ color: store.primaryColor || "hsl(var(--muted-foreground))" }} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{store.name}</h3>
            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-5 font-medium capitalize shadow-none border", statusColors)}>
              {store.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="font-mono opacity-80">/{store.slug}</span>
            <span>•</span>
            <span>{formatDate(store.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 mr-8">
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground font-medium">Products</span>
          <span className="text-sm font-bold">{store.productCount || 0}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground font-medium">Revenue</span>
          <span className="text-sm font-bold">{formatCurrency((store as any).revenue || 0, store.currency || "INR")}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="hidden sm:flex" asChild>
          <Link href={`/dashboard/stores/${store.slug}`}>Manage</Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/stores/${store.slug}/settings`}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/stores/${store.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" /> View Live
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// --- Sub-Component: Metrics Strip ---
const MetricsStrip = ({ stores, totalRevenue }: { stores: StoreData[]; totalRevenue: number }) => {
  const activeCount = stores.filter(s => s.status === "active").length;
  const totalProducts = stores.reduce((acc, s) => acc + (s.productCount || 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Total Stores", value: stores.length, icon: Store },
        { label: "Active Stores", value: activeCount, icon: TrendingUp },
        { label: "Total Products", value: totalProducts, icon: Package },
        { label: "Total Revenue", value: formatCurrency(totalRevenue, "INR"), icon: TrendingUp },
      ].map((stat, i) => (
        <div key={i} className="flex flex-col p-5 rounded-lg border border-border/50 bg-card shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <stat.icon className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// --- Helper: Get Greeting ---
const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${timeGreeting}, ${name}!`;
};

// --- Main Page Component ---
export default function DashboardPageClient() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("Welcome back"); // Client-side hydration safety

  const { isAuthenticated, user, isPending } = useSessionContext();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    enabled: isAuthenticated,
  });

  // Calculate greeting only on client to avoid hydration mismatch
  useEffect(() => {
    if (user?.name) {
      setGreeting(getGreeting(user.name.split(" ")[0]));
    }
  }, [user]);

  if (isError) toast.error((error as Error).message);

  const stores: StoreData[] = data?.stores ?? [];
  const totalRevenue = data?.totalRevenue ?? 0;
  const storeLimit = data ? {
    count: data.count,
    limit: data.limit,
    canCreateMore: data.canCreateMore,
  } : null;

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isPending || isLoading) {
    return (
      <DashboardLayout title="Dashboard" breadcrumbs={[{ label: "Dashboard" }]}>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // --- Unauthenticated View ---
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
            <Link href="/sign-in">Sign In <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>
      </div>
    );
  }

  // --- Authenticated Dashboard ---
  return (
    <DashboardLayout
      // 1. RE-ADDED IMAGE PROP HERE
      image={typeof user?.image === "string" ? user.image : undefined}
      // 2. Personalized Title
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

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stores..."
              className="pl-9 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-card/50 p-1 rounded-lg border border-border/50">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={cn("h-7 px-2 rounded-md transition-all", viewMode === "list" ? "bg-background shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset] text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30")}
                  >
                    <LayoutList className="h-4 w-4" />
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
                    className={cn("h-7 px-2 rounded-md transition-all", viewMode === "grid" ? "bg-background shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset] text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {filteredStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/50 rounded-lg bg-card/30">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No stores found</h3>
              <p className="text-muted-foreground text-sm max-w-sm text-center mb-6">
                {searchQuery ? "Try adjusting your search terms." : "You haven't created any stores yet."}
              </p>
              {!searchQuery && (
                <Button size="lg" className="rounded-lg" asChild>
                  <Link href="/dashboard/stores/new">
                    <Sparkles className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                    Create your first store
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <ViewSwitcher viewMode={viewMode} filteredStores={filteredStores} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
