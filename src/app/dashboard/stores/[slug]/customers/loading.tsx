import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { Users } from "lucide-react";

export default function Loading() {
  return (
    <DashboardLayout
      title="Customers"
      desc="View and manage your store customers"
      icon={<Users />}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Stores" },
        { label: "Customers" },
      ]}
      disableAnimation={true}
    >
      <div className="space-y-6">
        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-72 rounded-lg" />
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Customers Table */}
        <Card className="border-border/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 border-t border-border/40"
              >
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
