import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { Tags } from "lucide-react";

export default function Loading() {
  return (
    <DashboardLayout
      title="Categories"
      desc="Organize your products for a better customer experience."
      icon={<Tags className="text-indigo-500" />}
      breadcrumbs={[
        { label: "Stores", href: "/dashboard" },
        { label: "Loading..." },
        { label: "Categories" },
      ]}
      headerActions={
        <Skeleton className="h-10 w-36 rounded-full" />
      }
    >
      <div className="space-y-6">
        {/* Search Bar Skeleton */}
        <div className="max-w-md">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* Category Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="relative bg-card rounded-2xl border border-border/40 overflow-hidden"
              style={{
                animationDelay: `${i * 75}ms`,
              }}
            >
              {/* Image Placeholder with Shimmer */}
              <div className="aspect-[3/2] relative bg-muted/30">
                <Skeleton className="absolute inset-0 rounded-none" />
                {/* Centered Icon Placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Skeleton className="h-14 w-14 rounded-2xl mb-3" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              {/* Content Skeleton */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
