"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FunnelData {
  views: number;
  addToCarts: number;
  checkouts: number;
  purchases: number;
}

interface ConversionFunnelChartProps {
  data: FunnelData;
}

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const steps = [
    {
      label: "Product Views",
      value: data.views,
      color: "bg-blue-500",
      conversion: "100%",
    },
    {
      label: "Add to Cart",
      value: data.addToCarts,
      color: "bg-yellow-500",
      conversion: data.views > 0 ? `${((data.addToCarts / data.views) * 100).toFixed(1)}%` : "0%",
    },
    {
      label: "Checkout Started",
      value: data.checkouts,
      color: "bg-orange-500",
      conversion: data.addToCarts > 0 ? `${((data.checkouts / data.addToCarts) * 100).toFixed(1)}%` : "0%",
    },
    {
      label: "Completed Purchase",
      value: data.purchases,
      color: "bg-green-500",
      conversion: data.checkouts > 0 ? `${((data.purchases / data.checkouts) * 100).toFixed(1)}%` : "0%",
    },
  ];

  const maxValue = Math.max(...steps.map(step => step.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>
          Track how customers move through your purchase journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const percentage = maxValue > 0 ? (step.value / maxValue) * 100 : 0;

            return (
              <div key={step.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      step.color
                    )} />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{step.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{step.conversion}</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        step.color
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            <strong>Overall Conversion Rate:</strong>{" "}
            {data.views > 0 ? `${((data.purchases / data.views) * 100).toFixed(1)}%` : "0%"}
            <br />
            <span className="text-xs">
              {data.purchases} purchases from {data.views} product views
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
