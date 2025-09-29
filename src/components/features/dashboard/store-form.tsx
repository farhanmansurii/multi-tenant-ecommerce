"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Store, Save, ArrowLeft } from "lucide-react";

import { storeSchema, StoreFormData } from "@/lib/domains/stores/validations";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { LoadingState } from "./components/loading-state";
import { ErrorState } from "./components/error-state";
import { StoreImageUploadSection } from "./components/store-image-upload-section";
import {
  BasicInformationSection,
  BusinessDetailsSection,
  BrandingSection,
  PaymentAndShippingSection,
  LegalPoliciesSection,
} from "./components/store-form-sections";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface StoreFormProps {
  mode: "create" | "edit";
  storeData?: Partial<StoreFormData>;
  onSave: (data: StoreFormData) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  isAuthenticated?: boolean;
  isOwner?: boolean;
  storeLoading?: boolean;
  storeError?: Error | null;
}

export default function StoreForm({
  mode,
  storeData,
  onSave,
  onCancel,
  isSaving = false,
  isAuthenticated = true,
  isOwner = true,
  storeLoading = false,
  storeError = null,
}: StoreFormProps) {
  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      storeName: storeData?.storeName || "",
      storeSlug: storeData?.storeSlug || "",
      description: storeData?.description || "",
      tagline: storeData?.tagline || "",
      email: storeData?.email || "",
      phone: storeData?.phone || "",
      website: storeData?.website || "",
      address: storeData?.address || "",
      city: storeData?.city || "",
      state: storeData?.state || "",
      zipCode: storeData?.zipCode || "",
      country: storeData?.country || "",
      logo: storeData?.logo || "",
      favicon: storeData?.favicon || "",
      heroImages: storeData?.heroImages || [],
      primaryColor: storeData?.primaryColor || "#3B82F6",
      secondaryColor: storeData?.secondaryColor || "#10B981",
      currency: storeData?.currency || "INR",
      timezone: storeData?.timezone || "Asia/Kolkata",
      language: storeData?.language || "en",
      paymentMethods: storeData?.paymentMethods || [],
      upiId: storeData?.upiId || "",
      codEnabled: storeData?.codEnabled ?? false,
      stripeAccountId: storeData?.stripeAccountId || "",
      paypalEmail: storeData?.paypalEmail || "",
      shippingEnabled: storeData?.shippingEnabled ?? true,
      freeShippingThreshold: storeData?.freeShippingThreshold || undefined,
      shippingRates: storeData?.shippingRates || [],
      termsOfService: storeData?.termsOfService || "",
      privacyPolicy: storeData?.privacyPolicy || "",
      refundPolicy: storeData?.refundPolicy || "",
    },
  });

  const { handleSubmit, setValue, watch } = form;

  const logo = watch("logo");
  const heroImages = watch("heroImages") || [];

  const setLogo = (newLogo: string | undefined) => {
    setValue("logo", newLogo || "");
  };

  const setHeroImages = (
    newHeroImages:
      | typeof heroImages
      | ((prev: typeof heroImages) => typeof heroImages)
  ) => {
    if (typeof newHeroImages === "function") {
      setValue("heroImages", newHeroImages(heroImages));
    } else {
      setValue("heroImages", newHeroImages);
    }
  };

  const onSubmit = async (data: StoreFormData) => {
    try {
      await onSave(data);
    } catch (error) {
      console.error("Error saving store:", error);
    }
  };

  if (storeLoading) {
    return (
      <LoadingState
        message={
          mode === "create"
            ? "Preparing store creation..."
            : "Loading store details..."
        }
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md border rounded-lg p-6">
          <h2 className="text-center font-semibold text-lg">
            Authentication Required
          </h2>
          <p className="text-center text-muted-foreground mt-2">
            You must be logged in to {mode === "create" ? "create" : "edit"}{" "}
            stores.
          </p>
          <div className="text-center mt-4">
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "edit") {
    if (storeError) {
      return (
        <ErrorState
          title="Store Not Found"
          message={
            storeError instanceof Error
              ? storeError.message
              : "Failed to load store"
          }
        />
      );
    }

    if (!isOwner) {
      return (
        <ErrorState
          title="Access Denied"
          message="You don't have permission to manage this store"
          showPermissionAlert={true}
        />
      );
    }
  }

  const isCreateMode = mode === "create";
  const title = isCreateMode ? "Create New Store" : "Edit Store";
  const description = isCreateMode
    ? "Set up your store and start selling online."
    : "Update your store settings and information.";
  const submitButtonText = isCreateMode ? "Create Store" : "Save Changes";
  const submitButtonLoadingText = isCreateMode
    ? "Creating Store..."
    : "Saving Changes...";

  return (
    <DashboardLayout
      title={title}
      desc={description}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Stores", href: "/dashboard" },
        {
          label: isCreateMode
            ? "New Store"
            : storeData?.storeName || "Edit Store",
        },
      ]}
      icon={Store}
      headerActions={
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" form="store-form" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {submitButtonLoadingText}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {submitButtonText}
              </>
            )}
          </Button>
        </div>
      }
    >
      <form
        id="store-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <StoreImageUploadSection
          logo={logo}
          setLogo={setLogo}
          heroImages={heroImages}
          setHeroImages={setHeroImages}
        />

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="basic">
            <AccordionTrigger>Basic Information</AccordionTrigger>
            <AccordionContent className="p-2">
              <BasicInformationSection form={form} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="business">
            <AccordionTrigger>Business Details</AccordionTrigger>
            <AccordionContent>
              <BusinessDetailsSection form={form} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="branding">
            <AccordionTrigger>Branding</AccordionTrigger>
            <AccordionContent>
              <BrandingSection form={form} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payment">
            <AccordionTrigger>Payment & Shipping</AccordionTrigger>
            <AccordionContent>
              <PaymentAndShippingSection form={form} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="legal">
            <AccordionTrigger>Legal Policies</AccordionTrigger>
            <AccordionContent>
              <LegalPoliciesSection form={form} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </DashboardLayout>
  );
}
