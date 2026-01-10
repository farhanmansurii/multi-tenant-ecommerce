"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { StoreData, StoreFormPayload } from "@/lib/domains/stores/types";
import { StoreFormData } from "@/lib/domains/stores/validation";
import { storeDataToFormValues, storeFormValuesToPayload } from "@/lib/domains/stores/form";

import EditStoreForm from "@/components/forms/store/edit-store-form";
import { fetchStore, updateStore } from "@/lib/domains/stores/service";
import { useRequireAuth } from "@/lib/session";

interface StoreSettingsProps {
  params: Promise<{ slug: string }>;
}

import { usePermission } from "@/lib/auth/permissions";


export default function StoreSettings({ params }: StoreSettingsProps) {
  const { isAuthenticated, user, isPending } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { slug, isLoading: paramsLoading } = useDashboardParams(params);

  // Fetch store data
  const {
    data: store,
    isLoading: storeLoading,
    error: storeError,
  } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => fetchStore(slug!),
    enabled: !!slug && isAuthenticated,
    retry: 1,
  });

  // Check permissions
  const { can } = usePermission(store, user);
  const hasPermissionError = store && user && !can('manage_settings');

  // Update store mutation
  const updateMutation = useMutation({
    mutationFn: (payload: StoreFormPayload) => {
      if (!store) throw new Error("Store not found");
      return updateStore(store.slug, payload);
    },
    onSuccess: (updatedStore) => {
      queryClient.setQueryData(["store", slug], updatedStore);
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success("Store updated successfully!");
      router.refresh();
    },
    onError: (error: Error) => {
      console.error("Error updating store:", error);
      const errorMessage = error.message || "Failed to update store";
      toast.error(errorMessage);
    },
  });

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
      <div className="min-h-screen  flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              {errorMessage.includes("not found") ? "Store Not Found" : "Error Loading Store"}
            </CardTitle>
            <CardDescription className="text-center">{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
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
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Store Not Found
          </h1>
          <p className=" mb-6">
            The store you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
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
      isSuccess={updateMutation.isSuccess}
    />
  );
}
