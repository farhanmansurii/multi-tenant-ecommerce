"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Store, Save, ArrowLeft, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingState } from "./components/loading-state";
import { ErrorState } from "./components/error-state";
import { StoreImageUploadSection } from "./components/store-image-upload-section";
import { FormValidationErrors } from "./components/form-validation-errors";
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
import { PageCard } from "@/components/shared/layout/page-card";
import { buildStoreFormState } from "@/lib/domains/stores/form";
import { StoreFormData, storeSchema } from "@/lib/domains/stores/validation";

interface StoreFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<StoreFormData>;
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
  initialValues,
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
  const [activeTab, setActiveTab] = useState("basic");

  const resolvedDefaults = useMemo(
    () => buildStoreFormState(initialValues),
    [initialValues]
  );

  useEffect(() => {
    if (isSuccess) {
      setShowSavedMessage(true);
      const timer = setTimeout(() => setShowSavedMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const form = useForm<StoreFormData, any, StoreFormData>({
    resolver: zodResolver(storeSchema) as any,
    defaultValues: resolvedDefaults,
    mode: "onChange",
  });

  const { handleSubmit, setValue, watch, reset, formState: { errors } } = form;

  useEffect(() => {
    reset(resolvedDefaults);
  }, [reset, resolvedDefaults]);

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

  const fieldToTabMap: Record<string, string> = {
    storeName: "basic",
    storeSlug: "basic",
    tagline: "basic",
    description: "basic",
    logo: "media",
    favicon: "media",
    heroImages: "media",
    email: "business",
    phone: "business",
    website: "business",
    businessName: "business",
    businessType: "business",
    taxId: "business",
    address: "business",
    city: "business",
    state: "business",
    zipCode: "business",
    country: "business",
    primaryColor: "branding",
    secondaryColor: "branding",
    currency: "branding",
    timezone: "branding",
    language: "branding",
    paymentMethods: "payment",
    upiId: "payment",
    codEnabled: "payment",
    stripeAccountId: "payment",
    paypalEmail: "payment",
    shippingEnabled: "payment",
    freeShippingThreshold: "payment",
    shippingRates: "payment",
    termsOfService: "legal",
    privacyPolicy: "legal",
    refundPolicy: "legal",
  };

  const handleErrorClick = (fieldName: string) => {
    const tabValue = fieldToTabMap[fieldName];
    if (tabValue) {
      setActiveTab(tabValue);
    }

    setTimeout(() => {
      const selectors = [
        `[name="${fieldName}"]`,
        `#${fieldName}`,
        `input[name="${fieldName}"]`,
        `textarea[name="${fieldName}"]`,
        `select[name="${fieldName}"]`,
        `[data-field="${fieldName}"]`,
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setTimeout(() => {
            const input = element.querySelector('input, textarea, select, button[role="combobox"]') as HTMLElement;
            const targetElement = input || element;
            targetElement.focus();
            if (targetElement instanceof HTMLElement) {
              targetElement.click?.();
            }
          }, 200);
          break;
        }
      }
    }, 100);
  };

  const onSubmit = async (data: StoreFormData): Promise<void> => {
    if (isSaving) {
      return;
    }
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

  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6">
      {showSavedMessage && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            {mode === "create" ? "Store created successfully!" : "Store updated successfully!"}
          </AlertDescription>
        </Alert>
      )}

      {hasValidationErrors && !isSaving && (
        <FormValidationErrors errors={errors} onErrorClick={handleErrorClick} />
      )}

      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
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
          <Button
            type="submit"
            form="store-form"
            disabled={isSaving}
            className={showSavedMessage ? "bg-green-600 hover:bg-green-700" : ""}
          >
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

      <form
        id="store-form"
        onSubmit={handleSubmit(onSubmit, (validationErrors) => {
          console.error("Form validation errors:", validationErrors);
          const firstError = Object.keys(validationErrors)[0];
          if (firstError) {
            handleErrorClick(firstError);
          }
        })}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col lg:flex-row gap-8">
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
              <PageCard
                title="Basic Information"
                description="Manage your store's core details and identity."
              >
                <BasicInformationSection form={form} />
              </PageCard>
            </TabsContent>

            <TabsContent value="media" className="mt-0">
              <PageCard
                title="Media & Images"
                description="Upload your store logo and hero images."
              >
                <StoreImageUploadSection
                  logo={logo}
                  setLogo={setLogo}
                  heroImages={heroImages}
                  setHeroImages={setHeroImages}
                />
              </PageCard>
            </TabsContent>

            <TabsContent value="business" className="mt-0">
              <PageCard
                title="Business Details"
                description="Your contact info and business address."
              >
                <BusinessDetailsSection form={form} />
              </PageCard>
            </TabsContent>

            <TabsContent value="branding" className="mt-0">
              <PageCard
                title="Branding"
                description="Customize your store's appearance and regional settings."
              >
                <BrandingSection form={form} />
              </PageCard>
            </TabsContent>

            <TabsContent value="payment" className="mt-0">
              <PageCard
                title="Payment & Shipping"
                description="Configure how you accept payments and ship products."
              >
                <PaymentAndShippingSection form={form} />
              </PageCard>
            </TabsContent>

            <TabsContent value="legal" className="mt-0">
              <PageCard
                title="Legal Policies"
                description="Define your terms, privacy, and refund policies."
              >
                <LegalPoliciesSection form={form} />
              </PageCard>
            </TabsContent>
          </div>
        </Tabs>
      </form>
    </div>
  );
}
