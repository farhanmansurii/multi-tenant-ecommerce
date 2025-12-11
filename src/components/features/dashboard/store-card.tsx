import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { StoreData } from "@/lib/domains/stores/types";
import { formatDate, sanitizeText } from "@/lib/utils";
import { cn } from "@/lib/utils"; // Ensure you have this utility
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal,
  Package,
  PauseCircle,
  Settings,
  Slash,
  Store,
  ArrowRight,
  Globe,
  TrendingUp
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StoreCardProps {
  store: StoreData;
}

// Configuration for status visual states
const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return {
        icon: CheckCircle2,
        label: "Active",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        dot: "bg-emerald-500"
      };
    case "draft":
      return {
        icon: PauseCircle,
        label: "Draft",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        dot: "bg-amber-500"
      };
    case "suspended":
      return {
        icon: Slash,
        label: "Suspended",
        className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        dot: "bg-red-500"
      };
    default:
      return {
        icon: Store,
        label: "Unknown",
        className: "bg-muted text-muted-foreground border-border",
        dot: "bg-muted-foreground"
      };
  }
};

export default function StoreCard({ store }: StoreCardProps) {
  const statusConfig = getStatusConfig(store.status);

  const primaryColor = store.primaryColor || "#6366f1"; // Default Indigo

  return (
    <Card className="group relative flex flex-col overflow-hidden border border-border/60 bg-card transition-all duration-300 hover:border-border hover:shadow-lg hover:-translate-y-1">

      {/* Decorative Top Highlight (Glows on Hover) */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`
        }}
      />

      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-4">

          {/* Icon & Title Group */}
          <div className="flex gap-4">
            {/* Store Icon / Logo */}
            <div
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}40)`,
                color: primaryColor
              }}
            >
              <Store className="h-6 w-6" />
              {/* Active Dot indicator on the icon */}
              <span className={cn("absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-background", statusConfig.dot)} />
            </div>

            {/* Text Details */}
            <div className="space-y-1">
              <h3 className="font-bold leading-none tracking-tight text-foreground group-hover:text-primary transition-colors">
                {store.name}
              </h3>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span className="font-mono bg-muted/50 px-1 rounded-[4px]">/{store.slug}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <Badge
            variant="outline"
            className={cn("px-2.5 py-0.5 text-xs font-medium capitalize shadow-none transition-colors", statusConfig.className)}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-5 pt-2">
        {/* Description */}
        <p className="line-clamp-2 text-sm text-muted-foreground/80 min-h-[2.5rem] mb-6">
          {sanitizeText(store.description) || "No description provided. Add a description to help customers understand your store."}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40">
          <div className="bg-muted/10 p-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Products</span>
            </div>
            <span className="text-lg font-bold text-foreground">{store.productCount || 0}</span>
          </div>

          <div className="bg-muted/10 p-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Created</span>
            </div>
            <span className="text-sm font-semibold text-foreground mt-1 block">
              {new Date(store.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2 border-t border-transparent group-hover:border-border/40 transition-colors mt-auto">
        <TooltipProvider>
          {/* Primary Action */}
          <Button asChild className="flex-1 shadow-sm" variant="default">
            <Link href={`/dashboard/stores/${store.slug}`}>
              Manage Store
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          {/* Secondary Actions */}
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="hover:bg-muted hover:text-foreground" asChild>
                  <Link href={`/dashboard/stores/${store.slug}/settings`}>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Settings</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="hover:bg-muted hover:text-foreground" asChild>
                  <Link
                    href={`/stores/${store.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Visit Store</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Live Store</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
