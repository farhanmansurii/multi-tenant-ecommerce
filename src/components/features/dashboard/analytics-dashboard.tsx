"use client";

import React, { useState, useMemo, useCallback } from "react";
import { subDays } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Eye,
  Target,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { useAnalytics, useRecentActivity } from "@/hooks/queries/use-analytics";
import { MetricCard } from "@/components/shared/common/metric-card";
import { ConversionFunnelChart } from "./components/conversion-funnel-chart";
import { RevenueChart } from "./components/revenue-chart";
import { TopProductsTable } from "./components/top-products-table";
import { AnalyticsFilters } from "./components/analytics-filters";
import { RecentActivity } from "./components/recent-activity";
import { AnalyticsSkeleton } from "./components/analytics-skeleton";

interface AnalyticsDashboardProps {
  params: Promise<{ slug: string }>;
}

export function AnalyticsDashboard({ params }: AnalyticsDashboardProps) {
  const { slug } = useDashboardParams(params);
  const [dateRange, setDateRange] = useState(() => ({
    from: subDays(new Date(), 30),
    to: new Date(),
  }));
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");

  const analyticsParams = useMemo(() => ({
    startDate: dateRange.from,
    endDate: dateRange.to,
    period,
  }), [dateRange.from, dateRange.to, period]);

  const { data: analytics, isLoading, error } = useAnalytics(slug, analyticsParams);
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(slug, 10);

  const handleDateRangeChange = useCallback((range: { from: Date; to: Date }) => {
    setDateRange(range);
  }, []);

  const handlePeriodChange = useCallback((newPeriod: "day" | "week" | "month") => {
    setPeriod(newPeriod);
  }, []);

  if (isLoading) {
    return <AnalyticsSkeleton />;
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

  const metrics = useMemo(() => [
    { label: "Total Views", value: summary.totalViews.toLocaleString(), icon: Eye, color: "blue" as const, trend: summary.trends?.views },
    { label: "Add to Cart", value: summary.totalAddToCarts.toLocaleString(), icon: ShoppingCart, color: "emerald" as const, trend: summary.trends?.addToCarts },
    { label: "Total Orders", value: summary.totalPurchases.toLocaleString(), icon: Target, color: "purple" as const, trend: summary.trends?.purchases },
    { label: "Revenue", value: `$${summary.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "amber" as const, trend: summary.trends?.revenue },
  ], [summary]);

  return (
    <div className="space-y-6">
      <AnalyticsFilters
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        period={period}
        onPeriodChange={handlePeriodChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="relative">
            <MetricCard
              label={metric.label}
              value={metric.value}
              icon={metric.icon}
              color={metric.color}
            />
            {metric.trend !== undefined && (
              <div className="absolute top-3 right-3 text-xs flex items-center gap-1">
                {metric.trend >= 0 ? (
                  <span className="text-emerald-600 font-medium">
                    <TrendingUp className="h-3 w-3 inline" /> +{metric.trend.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    <TrendingDown className="h-3 w-3 inline" /> {metric.trend.toFixed(1)}%
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
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
