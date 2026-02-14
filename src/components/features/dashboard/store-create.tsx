"use client";

import { useRouter } from "next/navigation";

import { useRequireAuth } from "@/lib/session";

import EditStoreForm from "@/components/forms/store/edit-store-form";
import { Loader } from "@/components/shared/common/loader";
import { PageCard } from "@/components/shared/layout/page-card";
import { AlertCircle, Info } from "lucide-react";
import { StoreFormData } from "@/lib/domains/stores";
import { storeFormValuesToPayload } from "@/lib/domains/stores/form";
import { useStores } from "@/hooks/queries/use-stores";
import { useCreateStore } from "@/hooks/mutations/use-store-mutations";
import { Button } from "@/components/ui/button";

export default function StoreCreate() {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();
  const { data: storesData } = useStores();
  const createStoreMutation = useCreateStore();

  const storeLimit = storesData
    ? {
        count: storesData.count,
        limit: storesData.limit,
        canCreateMore: storesData.canCreateMore,
      }
    : null;

  const handleSave = async (values: StoreFormData): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error("Authentication required");
    }

    if (storeLimit && !storeLimit.canCreateMore) {
      throw new Error("Store limit reached");
    }

    const payload = storeFormValuesToPayload(values);
    const store = await createStoreMutation.mutateAsync(payload);

    setTimeout(() => {
      const targetSlug = store?.slug ?? "";
      if (targetSlug) {
        router.push(`/dashboard/stores/${targetSlug}`);
      } else {
        router.push("/dashboard/stores");
      }
    }, 1500);
  };

  const handleCancel = () => {
    router.push("/dashboard/stores");
  };

  if (isPending) {
    return <Loader text="Loading Store" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageCard
          title="Authentication Required"
          description="You must be logged in to create a store."
          variant="outlined"
          className="max-w-md"
        >
          <div className="text-center">
            <Button onClick={() => router.push("/sign-in")} className="w-full">
              Sign In
            </Button>
          </div>
        </PageCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {storeLimit && !storeLimit.canCreateMore && (
        <PageCard variant="outlined" className="border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-foreground">Store Limit Reached</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You have reached the maximum limit of {storeLimit.limit} stores. Please delete an
                existing store to create a new one.
              </p>
            </div>
          </div>
        </PageCard>
      )}

      {storeLimit && storeLimit.canCreateMore && (
        <PageCard variant="outlined" className="border-border/40 bg-card/80">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-foreground" />
            <p className="text-sm text-muted-foreground">
              You have {storeLimit.count} of {storeLimit.limit} stores.{" "}
              {storeLimit.limit - storeLimit.count} stores remaining.
            </p>
          </div>
        </PageCard>
      )}

      <EditStoreForm
        mode="create"
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={createStoreMutation.isPending}
        isSuccess={createStoreMutation.isSuccess}
      />
    </div>
  );
}
