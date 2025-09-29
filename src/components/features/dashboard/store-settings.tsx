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

import EditStoreForm from "@/components/forms/store/edit-store-form";
import { fetchStore } from "@/lib/domains/stores/service";
import { updateStore } from "@/lib/domains/stores/service";
import { useRequireAuth } from "@/lib/session";

interface StoreSettingsProps {
  params: Promise<{ slug: string }>;
}

function mapStoreToForm(store: StoreData): StoreFormPayload {
  return {
    storeName: store.name ?? "",
    storeSlug: store.slug ?? "",
    tagline: store.tagline ?? "",
    description: store.description ?? "",
    email: store.contactEmail ?? "",
    phone: store.contactPhone ?? "",
    website: store.website ?? "",
    businessType: store.businessType ?? "individual",
    businessName: store.businessName ?? "",
    taxId: store.taxId ?? "",
    address: store.addressLine1 ?? "",
    city: store.city ?? "",
    state: store.state ?? "",
    zipCode: store.zipCode ?? "",
    country: store.country ?? "",
    logo: store.logo ?? "",
    favicon: store.favicon ?? "",
    primaryColor: store.primaryColor ?? "#3B82F6",
    secondaryColor: store.secondaryColor ?? "#1E40AF",
    currency: store.currency ?? "INR",
    timezone: store.timezone ?? "Asia/Kolkata",
    language: store.language ?? "en",
    paymentMethods: Array.isArray(store.paymentMethods)
      ? store.paymentMethods
      : [],
    upiId: store.upiId ?? "",
    codEnabled: store.codEnabled ?? true,
    stripeAccountId: store.stripeAccountId ?? "",
    paypalEmail: store.paypalEmail ?? "",
    shippingEnabled: store.shippingEnabled ?? false,
    freeShippingThreshold:
      typeof store.freeShippingThreshold === "number"
        ? store.freeShippingThreshold
        : store.freeShippingThreshold
        ? Number(store.freeShippingThreshold)
        : 0,
    shippingRates: store.shippingRates ?? [],
    termsOfService: store.termsOfService ?? "",
    privacyPolicy: store.privacyPolicy ?? "",
    refundPolicy: store.refundPolicy ?? "",
    status: store.status ?? "draft",
    featured: store.featured ?? false,
  };
}

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
  const isOwner = store && user && store.ownerId === user.id;
  const hasPermissionError = store && user && !isOwner;

  // Update store mutation
  const updateMutation = useMutation({
    mutationFn: (values: Partial<StoreFormPayload>) => {
      if (!store) throw new Error("Store not found");

      const base = mapStoreToForm(store);
      const payload: StoreFormPayload = {
        ...base,
        ...values,
        paymentMethods: values.paymentMethods ?? base.paymentMethods,
        shippingRates: values.shippingRates ?? base.shippingRates,
        stripeAccountId: values.stripeAccountId ?? base.stripeAccountId,
        paypalEmail: values.paypalEmail ?? base.paypalEmail,
        freeShippingThreshold:
          values.freeShippingThreshold !== undefined
            ? values.freeShippingThreshold
            : base.freeShippingThreshold,
      };

      return updateStore(store.slug, payload);
    },
    onSuccess: (updatedStore) => {
      queryClient.setQueryData(["store", slug], updatedStore);
      toast.success("Store updated successfully!");
      router.refresh();
    },
    onError: (error: Error) => {
      console.error("Error updating store:", error);
      toast.error(error.message);
    },
  });

  const handleSave = async (values: Partial<StoreFormPayload>) => {
    updateMutation.mutate(values);
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
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
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

  const formData = mapStoreToForm(store);

  return (
    <EditStoreForm
      storeData={formData}
      onSave={handleSave}
      onCancel={() => router.back()}
      isSaving={updateMutation.isPending}
    />
  );
}
