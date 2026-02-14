"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Eye,
  ShoppingCart,
  CheckCircle,
  Search,
  User,
  Package,
  MinusCircle,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityItem {
  id: string;
  eventType: string;
  productId?: string;
  variantId?: string;
  orderId?: string;
  productName?: string;
  productImage?: string;
  value?: number; // cents
  currency?: string;
  quantity?: number;
  metadata?: Record<string, any>;
  timestamp: string;
  count: number;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

const baseActivityColor = {
  color: "bg-muted/50",
  bgColor: "bg-card/30",
};

const getActivityConfig = (eventType: string) => {
  switch (eventType) {
    case "view_product":
      return {
        icon: Eye,
        label: "Product viewed",
        ...baseActivityColor,
      };
    case "add_to_cart":
      return {
        icon: ShoppingCart,
        label: "Added to cart",
        ...baseActivityColor,
      };
    case "remove_from_cart":
      return {
        icon: MinusCircle,
        label: "Removed from cart",
        ...baseActivityColor,
      };
    case "purchase":
      return {
        icon: CheckCircle,
        label: "Purchase completed",
        ...baseActivityColor,
      };
    case "search":
      return {
        icon: Search,
        label: "Search performed",
        ...baseActivityColor,
      };
    case "checkout_start":
      return {
        icon: Package,
        label: "Checkout started",
        ...baseActivityColor,
      };
    default:
      return {
        icon: Activity,
        label: "Activity",
        ...baseActivityColor,
      };
  }
};

const formatActivityDescription = (activity: ActivityItem) => {
  const price = (value?: number, currency?: string) => {
    if (typeof value !== "number") return "";
    const amount = value / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  switch (activity.eventType) {
    case "view_product":
      if (activity.count > 1) {
        return `${activity.productName || "Product"} viewed ${activity.count} times`;
      }
      return activity.productName || "Product viewed";
    case "add_to_cart":
      return `${activity.productName || "Item"} • Qty ${activity.quantity ?? 1}${
        activity.value ? ` • ${price(activity.value, activity.currency)}` : ""
      }`;
    case "remove_from_cart":
      return `${activity.productName || "Item"} removed • Qty ${activity.quantity ?? 1}`;
    case "purchase":
      return `Order ${activity.orderId || ""} • ${price(activity.value, activity.currency)}`;
    case "search":
      return activity.metadata?.query
        ? `Search: "${activity.metadata.query}"${activity.metadata.resultsCount ? ` • ${activity.metadata.resultsCount} results` : ""}`
        : "Search query performed";
    case "checkout_start":
      return `Checkout process started`;
    default:
      return activity.eventType || "Activity occurred";
  }
};

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Loading recent activity...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest customer interactions and events from the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const config = getActivityConfig(activity.eventType);
              const Icon = config.icon;
              const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
                addSuffix: true,
              });

              return (
                <div
                  key={activity.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${config.bgColor}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${config.color}`} />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatActivityDescription(activity)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {timeAgo}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No recent activity in the last 7 days</p>
              <p className="text-xs text-muted-foreground">
                Activity will appear here as customers interact with your store
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
