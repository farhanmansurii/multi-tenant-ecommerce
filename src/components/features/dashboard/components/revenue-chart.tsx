"use client";

import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueDataPoint {
  period: string | Date;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  period: "day" | "week" | "month";
}

export function RevenueChart({ data, period }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>No data available for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No revenue data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const maxOrders = Math.max(...data.map((d) => d.orders));

  const formatPeriod = (periodStr: string | Date) => {
    const date = typeof periodStr === "string" ? new Date(periodStr) : periodStr;

    switch (period) {
      case "day":
        return format(date, "MMM dd");
      case "week":
        return format(date, "MMM dd");
      case "month":
        return format(date, "MMM yyyy");
      default:
        return format(date, "MMM dd");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <CardDescription>Daily revenue and order volume over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between gap-1">
              {data.map((point, index) => {
                const revenueHeight = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
                const ordersHeight = maxOrders > 0 ? (point.orders / maxOrders) * 100 : 0;

                return (
                  <div key={index} className="flex flex-col items-center flex-1 max-w-8">
                    {/* Revenue bar */}
                    <div className="relative w-full mb-1">
                      <div
                        className="w-full bg-muted/40 rounded-t transition-all duration-300 hover:bg-muted/60"
                        style={{ height: `${Math.max(revenueHeight, 4)}px` }}
                      />
                      {point.revenue > 0 && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground">
                          ${point.revenue.toFixed(0)}
                        </div>
                      )}
                    </div>

                    {/* Orders bar (smaller, on top) */}
                    <div className="relative w-3/4">
                      <div
                        className="w-full bg-muted/30 rounded-t transition-all duration-300 hover:bg-muted/50"
                        style={{ height: `${Math.max(ordersHeight, 4)}px` }}
                      />
                      {point.orders > 0 && (
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground">
                          {point.orders}
                        </div>
                      )}
                    </div>

                    {/* Period label */}
                    <div className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-top">
                      {formatPeriod(point.period)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted/60 rounded"></div>
              <span>Revenue ($)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted/40 rounded"></div>
              <span>Orders</span>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                ${data.reduce((sum, d) => sum + d.revenue, 0).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {data.reduce((sum, d) => sum + d.orders, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
