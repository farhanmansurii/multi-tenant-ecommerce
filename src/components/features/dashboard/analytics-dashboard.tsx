"use client";

import React, { useState } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  CalendarDays,
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  Eye,
  Target,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { useAnalytics, useRecentActivity } from "@/hooks/queries/use-analytics";
import { MetricCard } from "./components/metric-card";
import { ConversionFunnelChart } from "./components/conversion-funnel-chart";
import { RevenueChart } from "./components/revenue-chart";
import { TopProductsTable } from "./components/top-products-table";
import { AnalyticsFilters } from "./components/analytics-filters";
import { RecentActivity } from "./components/recent-activity";

interface AnalyticsDashboardProps {
  params: Promise<{ slug: string }>;
}

export function AnalyticsDashboard({ params }: AnalyticsDashboardProps) {
  const { slug } = useDashboardParams(params);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");

  const { data: analytics, isLoading, error } = useAnalytics(slug, {
    startDate: dateRange.from,
    endDate: dateRange.to,
    period,
  });

  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(slug, 10);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top products table skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Failed to Load Analytics
            </CardTitle>
            <CardDescription className="text-center">
              {error?.message || "Unable to load analytics data. Please try again later."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { summary, topProducts, funnel, revenueByPeriod } = analytics;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <AnalyticsFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        period={period}
        onPeriodChange={setPeriod}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={summary.totalViews.toLocaleString()}
          icon={Eye}
          trend="+12.5%"
          description="Product page views"
        />
        <MetricCard
          title="Add to Cart"
          value={summary.totalAddToCarts.toLocaleString()}
          icon={ShoppingCart}
          trend="+8.2%"
          description="Items added to cart"
        />
        <MetricCard
          title="Total Orders"
          value={summary.totalPurchases.toLocaleString()}
          icon={Target}
          trend="+15.3%"
          description="Completed purchases"
        />
        <MetricCard
          title="Revenue"
          value={`$${summary.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend="+18.7%"
          description="Total sales revenue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalPurchases} purchases from {summary.totalViews} views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cart Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary.totalAddToCarts > 0
                ? ((summary.totalPurchases / summary.totalAddToCarts) * 100).toFixed(1)
                : "0"
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              From cart to purchase
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnelChart data={funnel} />
        <RevenueChart data={revenueByPeriod} period={period} />
      </div>

      <TopProductsTable products={topProducts} />

      <RecentActivity
        activities={recentActivity?.activities || []}
        isLoading={activityLoading}
      />
    </div>
  );
}
