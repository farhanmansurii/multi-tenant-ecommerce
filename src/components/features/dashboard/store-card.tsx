import React from "react";
import Link from "next/link";
import Image from "next/image";
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
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Package,
  PauseCircle,
  Settings,
  Slash,
  Store,
  ArrowRight,
  Globe,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CompactMetric } from "@/components/shared/common/compact-metric";

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
    <Link href={`/dashboard/stores/${store.slug}`} className="block h-full">
      <Card className="group relative flex flex-col overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:-translate-y-1.5 cursor-pointer h-full">
        <CardHeader className="p-6 pb-5 relative">
          <div className="absolute top-6 right-6 z-10">
            <Badge
              variant="outline"
              className={cn("px-2.5 py-1 text-[10px] font-semibold capitalize border shadow-sm", statusConfig.className)}
            >
              {statusConfig.label}
            </Badge>
          </div>

          <div className="flex items-start gap-4 mb-5">
            {store.logo ? (
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden shrink-0 border-2 border-border/50 bg-muted shadow-md group-hover:shadow-lg transition-shadow">
                <Image
                  src={store.logo}
                  alt={store.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <div
                className="relative h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 border-2 border-border/50 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}30)`,
                  borderColor: `${primaryColor}40`
                }}
              >
                <Store className="h-8 w-8" style={{ color: primaryColor }} />
                <span className={cn("absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background shadow-sm", statusConfig.dot)} />
              </div>
            )}

            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
                {store.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5 opacity-70" />
                <span className="font-mono opacity-80">/{store.slug}</span>
              </div>
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed min-h-[2.75rem]">
            {sanitizeText(store.description) || "No description provided. Add a description to help customers understand your store."}
          </p>
        </CardHeader>

        <CardContent className="flex-1 p-6 pt-0">
          <div className="grid grid-cols-2 gap-3">
            <CompactMetric
              label="Products"
              value={store.productCount || 0}
              icon={Package}
              color="purple"
            />
            <CompactMetric
              label="Created"
              value={new Date(store.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              icon={CalendarDays}
              color="blue"
            />
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-5 gap-2 border-t border-border/40 bg-muted/20 mt-auto">
          <Button asChild className="flex-1 rounded-lg h-10 font-medium" variant="default">
            <span className="flex items-center justify-center">
              Manage Store
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>

          <TooltipProvider>
            <div className="flex gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg hover:bg-muted hover:text-foreground border-border/50" asChild onClick={(e) => e.stopPropagation()}>
                    <Link href={`/dashboard/stores/${store.slug}/settings`}>
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Settings</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg hover:bg-muted hover:text-foreground border-border/50" asChild onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/stores/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
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
    </Link>
  );
}
