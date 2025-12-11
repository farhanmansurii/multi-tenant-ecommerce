"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, TooltipProps } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils";

interface SalesChartProps {
  data: {
    name: string;
    total: number;
  }[];
  currency?: string;
}

// Compact number formatter for Y-axis (50K, 1M, etc.)
function formatCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toString();
}

// Custom tooltip component using proper Tailwind/shadcn classes
function CustomTooltip({ active, payload, label, currency }: TooltipProps<number, string> & { currency: string }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const value = payload[0]?.value || 0;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
      <p className="font-semibold text-card-foreground mb-1">{label}</p>
      <p className="text-sm text-muted-foreground">
        Revenue: <span className="font-medium text-card-foreground">{formatCurrency(value, currency)}</span>
      </p>
    </div>
  );
}

export function SalesChart({ data, currency = "INR" }: SalesChartProps) {
  const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <Card className="col-span-4 border-none shadow-sm bg-card/50 hover:bg-card transition-colors">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>
          Total revenue for the last 6 months: <span className="font-medium text-foreground">{formatCurrency(totalRevenue, currency)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(value) => formatCompact(value)}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              content={<CustomTooltip currency={currency} />}
            />
            <Bar
              dataKey="total"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
