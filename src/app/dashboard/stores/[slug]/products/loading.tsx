import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { Package } from "lucide-react";

export default function Loading() {
  return (
    <DashboardLayout
      title="Products"
      desc="Manage your store products"
      icon={<Package />}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Stores" },
        { label: "Products" },
      ]}
      headerActions={
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      }
      disableAnimation={true}
    >
      <div className="space-y-4">
        {/* Header Section - Match exact structure */}
        <div className="flex items-center justify-between px-1">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Products Card - Match exact structure */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          {/* Toolbar Section */}
          <div className="p-4 border-b">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Skeleton className="h-9 w-full sm:w-[300px] rounded-md" />
                <Skeleton className="h-9 w-20" />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </div>

          {/* Content Area - Match exact structure with grid/list view */}
          <div className="p-6 bg-muted/5 min-h-[400px]">
            {/* List view skeleton (default) */}
            <div className="space-y-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-4 border-b border-border/40 last:border-0"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
