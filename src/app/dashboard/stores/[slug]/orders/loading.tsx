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
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Stores" },
        { label: "Orders" },
      ]}
      headerActions={
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/40">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-16 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Orders Table */}
        <Card className="border-border/40">
          <CardContent className="p-0">
            <div className="border-b border-border/40 px-6 py-3 flex items-center gap-4 bg-muted/30">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-4 w-16" />
            </div>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 border-b border-border/40 last:border-0"
              >
                <Skeleton className="h-4 w-28" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full ml-auto" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
