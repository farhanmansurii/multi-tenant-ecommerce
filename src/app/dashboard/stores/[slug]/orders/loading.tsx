import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { ClipboardList } from "lucide-react";

export default function Loading() {
  return (
    <DashboardLayout
      title="Orders"
      desc="View and manage all customer orders"
      icon={<ClipboardList />}
      breadcrumbs={[
        { label: "Stores", href: "/dashboard/stores" },
        { label: "Store" },
        { label: "Orders" },
      ]}
      headerActions={
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      }
      disableAnimation={true}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Orders" },
            { label: "Pending" },
            { label: "Processing" },
            { label: "Delivered" },
          ].map((stat, i) => (
            <Card key={i} className="border-border/40">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <Card className="border-border/40">
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              <div className="grid grid-cols-7 gap-4 px-0 py-3 border-b border-border/40">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-7 gap-4 px-0 py-4 border-b border-border/40 last:border-0 items-center"
                >
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <div className="flex items-center justify-end gap-2 ml-auto">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
