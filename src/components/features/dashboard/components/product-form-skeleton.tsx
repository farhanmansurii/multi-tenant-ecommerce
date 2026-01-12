import { Skeleton } from "@/components/ui/skeleton";

export function ProductFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-24" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
      </div>

      <div className="space-y-8">
        <section className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-32 w-full rounded-lg border-2 border-dashed" />
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full ml-4" />
              </div>
            ))}
            <div className="md:col-span-2 flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full ml-4" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
