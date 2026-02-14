"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus, Store } from "lucide-react";

import { fetchStores } from "@/lib/domains/stores/service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

type StoresResponse = {
  stores?: { id: string; name: string; slug: string; logo?: string | null }[];
};

export function StoreSwitcher() {
  const params = useParams();
  const activeSlug = typeof params?.slug === "string" ? params.slug : undefined;

  const { data, isLoading } = useQuery<StoresResponse>({
    queryKey: ["stores", "switcher"],
    queryFn: fetchStores,
  });

  const stores = Array.isArray(data?.stores) ? data!.stores : [];
  const activeStore = activeSlug ? stores.find((s) => s.slug === activeSlug) : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-10 justify-between gap-2 rounded-xl px-3",
            "bg-card/40 hover:bg-muted/40",
            "border border-border/40",
            "w-[170px] sm:w-[240px]",
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted shrink-0">
              <Store className="h-4 w-4 text-foreground" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-semibold leading-tight">
                {isLoading ? <Skeleton className="h-4 w-32" /> : (activeStore?.name || "Select a store")}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {activeSlug ? `/${activeSlug}` : "Your workspace"}
              </span>
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px] p-2">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Stores</DropdownMenuLabel>
        {stores.length === 0 ? (
          <div className="px-2 py-6 text-sm text-muted-foreground">No stores yet.</div>
        ) : (
          stores.map((store) => {
            const isActive = store.slug === activeSlug;
            return (
              <DropdownMenuItem key={store.id} asChild className="cursor-pointer rounded-lg">
                <Link href={`/dashboard/stores/${store.slug}`} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Store className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{store.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">/{store.slug}</span>
                  </span>
                  {isActive && <Check className="h-4 w-4 text-foreground" />}
                </Link>
              </DropdownMenuItem>
            );
          })
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
          <Link href="/dashboard/stores/new" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Plus className="h-4 w-4 text-foreground" />
            </span>
            <span className="text-sm font-medium">Create store</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
