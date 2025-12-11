"use client";

import { useEffect, useState } from "react"; // 1. Import useEffect
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Store, Save, ArrowLeft, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StoreFormData, storeSchema } from "@/lib/domains/stores/validation";

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
  isSuccess?: boolean;
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
  isSuccess = false,
}: StoreFormProps) {
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSavedMessage(true);
      const timer = setTimeout(() => setShowSavedMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

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

  const { handleSubmit, setValue, watch, reset } = form;

  // Reset form when storeData changes (e.g. after loading)
  useEffect(() => {
    if (storeData) {
      reset({
        ...storeData,
        heroImages: storeData.heroImages || [],
      });
    }
  }, [storeData, reset]);

  const logo = watch("logo");
  const heroImages = watch("heroImages") || [];

  const setLogo = (newLogo: string | undefined) => {
    setValue("logo", newLogo || "", { shouldDirty: true, shouldTouch: true });
  };

  const setHeroImages = (
    newHeroImages:
      | typeof heroImages
      | ((prev: typeof heroImages) => typeof heroImages)
  ) => {
    const updatedImages = typeof newHeroImages === "function"
      ? newHeroImages(heroImages)
      : newHeroImages;

    setValue("heroImages", updatedImages, { shouldDirty: true, shouldTouch: true });
  };

  const onSubmit = async (data: StoreFormData) => {
    try {
      await onSave(data);
    } catch (error) {
      console.error("Error saving store:", error);
    }
  };

  // ... (Rest of the component remains exactly the same)
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
    <div className="space-y-8 pb-10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b -mx-6 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground hidden md:block">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" form="store-form" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {submitButtonLoadingText}
              </>
            ) : showSavedMessage ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {submitButtonText}
              </>
            )}
          </Button>
        </div>
      </div>

      <form id="store-form" onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="w-full flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <TabsList className="flex flex-col h-auto w-full items-stretch p-0 bg-transparent gap-1">
                <TabsTrigger
                  value="basic"
                  className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors"
                >
                  Basic Information
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors"
                >
                  Media & Images
                </TabsTrigger>
                <TabsTrigger
                  value="business"
                  className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors"
                >
                  Business Details
                </TabsTrigger>
                <TabsTrigger
                  value="branding"
                  className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors"
                >
                  Branding
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors"
                >
                  Payment & Shipping
                </TabsTrigger>
                <TabsTrigger
                  value="legal"
                  className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors"
                >
                  Legal Policies
                </TabsTrigger>
              </TabsList>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            <TabsContent value="basic" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Manage your store's core details and identity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BasicInformationSection form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Media & Images</CardTitle>
                  <CardDescription>
                    Upload your store logo and hero images.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StoreImageUploadSection
                    logo={logo}
                    setLogo={setLogo}
                    heroImages={heroImages}
                    setHeroImages={setHeroImages}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>
                    Your contact info and business address.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BusinessDetailsSection form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>
                    Customize your store's appearance and regional settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BrandingSection form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Payment & Shipping</CardTitle>
                  <CardDescription>
                    Configure how you accept payments and ship products.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentAndShippingSection form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="legal" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Legal Policies</CardTitle>
                  <CardDescription>
                    Define your terms, privacy, and refund policies.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LegalPoliciesSection form={form} />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </form>
    </div>
  );
}
