import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { SlidersHorizontal } from "lucide-react";

export default function Loading() {
  return (
    <DashboardLayout
      title="Configure"
      desc="Manage store configuration with section-based saves."
      icon={<SlidersHorizontal />}
      breadcrumbs={[
        { label: "Stores", href: "/dashboard/stores" },
        { label: "Store" },
        { label: "Configure" },
      ]}
      disableAnimation={true}
    >
      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <div className="space-y-2 rounded-xl border p-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <div className="space-y-4 rounded-xl border p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
