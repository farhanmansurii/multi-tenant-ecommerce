"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, StoreIcon } from "lucide-react";
import { toast } from "sonner";

import { useRequireAuth } from "@/lib/session-context";
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
import DualStoreForm from "@/components/forms/store/edit-store-form";
import { Loader } from "@/components/shared/common/loader";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { StoreData, StoreFormPayload } from "@/lib/types/store";

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
    address: store.addressLine1 ?? store.address ?? "",
    city: store.city ?? "",
    state: store.state ?? "",
    zipCode: store.zipCode ?? "",
    country: store.country ?? "",
    logo: store.logo ?? "",
    favicon: store.favicon ?? "",
    primaryColor: store.primaryColor ?? "#3B82F6",
    secondaryColor: store.secondaryColor ?? "#1E40AF",
    currency: store.currency ?? "USD",
    timezone: store.timezone ?? "America/New_York",
    language: store.language ?? "en",
    paymentMethods: Array.isArray(store.paymentMethods)
      ? store.paymentMethods
      : [],
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
  const { slug, isLoading: paramsLoading } = useDashboardParams(params);

  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && slug && !paramsLoading) {
      fetchStore(slug, user.id);
    }
  }, [isAuthenticated, user, slug, paramsLoading]);

  const fetchStore = async (storeSlug: string, userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${storeSlug}`);

      if (response.ok) {
        const data = await response.json();
        const storeData = data.store as StoreData;
        setStore(storeData);

        if (storeData.ownerId === userId) {
          setIsOwner(true);
        } else {
          setError("You don't have permission to edit this store");
        }
      } else if (response.status === 404) {
        setError("Store not found");
      } else {
        setError("Failed to load store");
      }
    } catch (err) {
      console.error("Error fetching store:", err);
      setError("An error occurred while loading the store");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: Partial<StoreFormPayload>) => {
    if (!store) return;

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

    setSaving(true);
    try {
      const response = await fetch(`/api/stores/${store.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to update store");
      }

      const data = await response.json();
      setStore(data.store as StoreData);
      toast.success("Store updated successfully!");
      router.refresh();
    } catch (err) {
      console.error("Error saving store:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update store"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!store) return;

    const confirmed = window.confirm(
      "Deleting this store will permanently remove the store and all products under it. This action cannot be undone. Are you sure you want to continue?"
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/stores/${store.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete store");
      }

      toast.success("Store deleted successfully");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Error deleting store:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete store"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isPending || paramsLoading || loading) {
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

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
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
    <DashboardLayout
      title="Edit Store"
      desc="Choose the setup experience that fits your workflow. Your latest
            settings will be shown when you open each mode."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Stores", href: "/dashboard" },
        { label: store.name, href: "/dashboard" },
        { label: "Settings" },
      ]}
      icon={StoreIcon}
      headerActions={
        isOwner && (
          <Button
            variant="destructive"
            className="w-full justify-center"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader size={16} text="" className="mr-2" />
                Deleting Store...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Store
              </>
            )}
          </Button>
        )
      }
    >
      <DualStoreForm
        storeData={formData}
        isEditPage
        onSave={handleSave}
        onCancel={() => router.back()}
        isSaving={saving}
      />
    </DashboardLayout>
  );
}
