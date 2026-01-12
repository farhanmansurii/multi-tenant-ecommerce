"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useDashboardParams } from "@/hooks/use-dashboard-params";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/shared/common/loader";
import { StoreFormData } from "@/lib/domains/stores/validation";
import { storeDataToFormValues, storeFormValuesToPayload } from "@/lib/domains/stores/form";

import EditStoreForm from "@/components/forms/store/edit-store-form";
import { useRequireAuth } from "@/lib/session";
import { useStore } from "@/hooks/queries/use-store";
import { useUpdateStore } from "@/hooks/mutations/use-store-mutations";

interface StoreSettingsProps {
  params: Promise<{ slug: string }>;
}

import { usePermission } from "@/lib/auth/permissions";
import { NotFoundState } from "@/components/shared/common/not-found-state";


export default function StoreSettings({ params }: StoreSettingsProps) {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();
  const { slug, isLoading: paramsLoading } = useDashboardParams(params);

  const {
    data: store,
    isLoading: storeLoading,
    error: storeError,
  } = useStore(slug && isAuthenticated ? slug : null);

  const { can } = usePermission(store, user);
  const hasPermissionError = store && user && !can('manage_settings');
  const isOwner = !!(store && user && store.ownerUserId === user.id);

  const updateMutation = useUpdateStore(slug || "");

  const handleSave = async (values: StoreFormData): Promise<void> => {
    if (!store) {
      throw new Error('Store not found');
    }
    const payload = storeFormValuesToPayload(values, store);
    await updateMutation.mutateAsync(payload);
  };


  if (isPending || paramsLoading || storeLoading) {
    return <Loader text="Loading store..." className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-center">
              You must be logged in to edit stores.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (storeError) {
    const errorMessage = storeError instanceof Error ? storeError.message : "Failed to load store";
    return (
      <NotFoundState
        title={errorMessage.includes("not found") ? "Store Not Found" : "Error Loading Store"}
        message={errorMessage}
        backHref="/dashboard/stores"
        backLabel="Back to Stores"
      />
    );
  }

  if (hasPermissionError) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="text-center">
              You don&apos;t have permission to edit this store.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Only the store owner can edit this store.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href={`/stores/${slug}`}>View Store</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!store) {
    return (
      <NotFoundState
        title="Store Not Found"
        message="The store you're looking for doesn't exist."
        backHref="/dashboard/stores"
        backLabel="Back to Stores"
      />
    );
  }

  const formData = React.useMemo(() => {
    return store ? storeDataToFormValues(store) : undefined;
  }, [store]);

  return (
    <EditStoreForm
      initialValues={formData}
      onSave={handleSave}
      onCancel={() => router.back()}
      isSaving={updateMutation.isPending}
      isAuthenticated={isAuthenticated}
      isOwner={isOwner}
      storeLoading={storeLoading}
      storeError={storeError}
      isSuccess={updateMutation.isSuccess}
      slug={slug}
    />
  );
}
