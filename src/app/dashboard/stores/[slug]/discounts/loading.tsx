import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { Percent } from "lucide-react";

export default function Loading() {
  return (
    <DashboardLayout
      title="Discounts"
      desc="Create and manage discount codes"
      icon={<Percent />}
      breadcrumbs={[
        { label: "Stores", href: "/dashboard/stores" },
        { label: "Discounts" },
      ]}
      headerActions={<Skeleton className="h-10 w-36 rounded-full" />}
      disableAnimation={true}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-border/40">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-border/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24 font-mono" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
