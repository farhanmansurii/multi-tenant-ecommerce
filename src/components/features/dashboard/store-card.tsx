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
    <Card className="group relative flex flex-col overflow-hidden border border-border/50 bg-card transition-all duration-200 hover:border-border/70 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">


      <CardHeader className="p-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 min-w-0">
            <div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/30 transition-transform duration-200 group-hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}12, ${primaryColor}25)`,
                color: primaryColor
              }}
            >
              <Store className="h-5 w-5" />
              <span className={cn("absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-background", statusConfig.dot)} />
            </div>

            <div className="space-y-1 min-w-0">
              <h3 className="font-semibold leading-none tracking-tight text-foreground group-hover:text-foreground/90 transition-colors truncate">
                {store.name}
              </h3>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="h-3 w-3 opacity-60" />
                <span className="font-mono opacity-70">/{store.slug}</span>
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn("px-2 py-0.5 text-[10px] font-medium capitalize border shrink-0", statusConfig.className)}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-5 pt-0">
        <p className="line-clamp-2 text-sm text-muted-foreground min-h-[2.5rem] mb-5 leading-relaxed">
          {sanitizeText(store.description) || "No description provided. Add a description to help customers understand your store."}
        </p>

        <div className="grid grid-cols-2 gap-px bg-border/30 rounded-md overflow-hidden border border-border/40">
          <div className="bg-muted/5 p-3 hover:bg-muted/15 transition-colors">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Package className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
              <span className="text-xs font-medium text-muted-foreground">Products</span>
            </div>
            <span className="text-base font-semibold text-foreground">{store.productCount || 0}</span>
          </div>

          <div className="bg-muted/5 p-3 hover:bg-muted/15 transition-colors">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
              <span className="text-xs font-medium text-muted-foreground">Created</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {new Date(store.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-4 gap-2 border-t border-transparent group-hover:border-border/30 transition-colors mt-auto">
        <TooltipProvider>
          <Button asChild className="flex-1" variant="default">
            <Link href={`/dashboard/stores/${store.slug}`}>
              Manage Store
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
