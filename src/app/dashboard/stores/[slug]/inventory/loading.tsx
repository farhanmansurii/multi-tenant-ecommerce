import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { AlertTriangle } from "lucide-react";

export default function Loading() {
  return (
    <DashboardLayout
      title="Inventory Alerts"
      desc="Monitor and manage product stock levels"
      icon={<AlertTriangle />}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Stores" },
        { label: "Inventory" },
      ]}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Low Stock", color: "bg-amber-500/10" },
            { label: "Out of Stock", color: "bg-red-500/10" },
            { label: "Healthy Stock", color: "bg-emerald-500/10" },
          ].map((item, i) => (
            <Card key={i} className={`border-border/40 ${item.color}`}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {["All", "Low Stock", "Out of Stock"].map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-lg" />
          ))}
        </div>

        {/* Inventory Table */}
        <Card className="border-border/40">
          <CardContent className="p-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 border-b border-border/40 last:border-0"
              >
                <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-5 w-12 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
