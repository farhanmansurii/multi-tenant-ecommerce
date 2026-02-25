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
        { label: "Stores", href: "/dashboard/stores" },
        { label: "Store" },
        { label: "Inventory" },
      ]}
      disableAnimation={true}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Products" },
            { label: "Out of Stock" },
            { label: "Low Stock" },
            { label: "Healthy Stock" },
          ].map((stat, i) => (
            <Card key={i} className="border-border/40">
              <CardHeader>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="border-border/40">
          <CardHeader>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              <div className="grid grid-cols-4 gap-4 px-0 py-3 border-b border-border/40">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-4 px-0 py-4 border-b border-border/40 last:border-0 items-center"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-12 mx-auto" />
                  <Skeleton className="h-6 w-20 rounded-full mx-auto" />
                  <Skeleton className="h-8 w-24 rounded-md ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
