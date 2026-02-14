"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Store, Save, ArrowLeft, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingState } from "./components/loading-state";
import { ErrorState } from "./components/error-state";
import { NotFoundState } from "@/components/shared/common/not-found-state";
import { StoreImageUploadSection } from "./components/store-image-upload-section";
import { FormValidationErrors } from "./components/form-validation-errors";
import { BasicsSection, CheckoutSection, PoliciesSection } from "./components/store-form-sections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageCard } from "@/components/shared/layout/page-card";
import { buildStoreFormState } from "@/lib/domains/stores/form";
import { StoreFormData, storeSchema } from "@/lib/domains/stores/validation";
import { cn } from "@/lib/utils";

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
  slug?: string;
  /** When the page already has a header (DashboardLayout), hide the form's internal title block. */
  hidePageHeading?: boolean;
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
  slug,
  hidePageHeading = false,
}: StoreFormProps) {
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");
  const tabsListRef = React.useRef<HTMLDivElement>(null);

  // Scroll active tab into view on mobile when tab changes
  useEffect(() => {
    if (tabsListRef.current) {
      const activeTabElement = tabsListRef.current.querySelector(`[data-state="active"]`);
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTab]);

  const resolvedDefaults = useMemo(() => buildStoreFormState(initialValues), [initialValues]);

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

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset(resolvedDefaults);
  }, [reset, resolvedDefaults]);

  const logo = watch("logo");

  const setLogo = (newLogo: string | undefined) => {
    setValue("logo", newLogo || "", { shouldDirty: true, shouldTouch: true });
  };

  const fieldToTabMap: Record<string, string> = {
    storeName: "basics",
    storeSlug: "basics",
    description: "basics",
    email: "basics",
    logo: "basics",
    primaryColor: "basics",
    currency: "checkout",
    paymentMethods: "checkout",
    codEnabled: "checkout",
    shippingEnabled: "checkout",
    freeShippingThreshold: "checkout",
    termsOfService: "policies",
    privacyPolicy: "policies",
    refundPolicy: "policies",
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
            const input = element.querySelector(
              'input, textarea, select, button[role="combobox"]',
            ) as HTMLElement;
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
        message={mode === "create" ? "Preparing store creation..." : "Loading store details..."}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md border rounded-lg p-6">
          <h2 className="text-center font-semibold text-lg">Authentication Required</h2>
          <p className="text-center text-muted-foreground mt-2">
            You must be logged in to {mode === "create" ? "create" : "edit"} stores.
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
        <NotFoundState
          title="Store Not Found"
          message={storeError instanceof Error ? storeError.message : "Failed to load store"}
          backHref="/dashboard/stores"
          backLabel="Back to Stores"
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
  const submitButtonText = isCreateMode ? "Create Store" : "Save Changes";
  const submitButtonLoadingText = isCreateMode ? "Creating Store..." : "Saving Changes...";

  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6">
      {showSavedMessage && (
        <Alert className="border-border/40 bg-card/80">
          <Check className="h-4 w-4 text-foreground" />
          <AlertTitle className="text-foreground">Success</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {mode === "create" ? "Store created successfully!" : "Store updated successfully!"}
          </AlertDescription>
        </Alert>
      )}

      {hasValidationErrors && !isSaving && (
        <FormValidationErrors errors={errors} onErrorClick={handleErrorClick} />
      )}

      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
          hidePageHeading ? "pb-2" : "pb-4 border-b",
        )}
      >
        {!hidePageHeading ? (
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isCreateMode ? "Create New Store" : "Edit Store"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isCreateMode
                ? "Set up your store and start selling online."
                : "Update your store settings and information."}
            </p>
          </div>
        ) : (
          <div />
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" form="store-form" disabled={isSaving} className="w-full sm:w-auto">
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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8"
        >
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-4 lg:top-24">
              <div className="relative">
                {/* Gradient fade indicators for mobile */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 lg:hidden" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 lg:hidden" />
                <TabsList
                  ref={tabsListRef}
                  className="flex flex-row lg:flex-col h-auto w-full items-stretch p-0 bg-transparent gap-1 overflow-x-auto lg:overflow-x-visible scrollbar-hide snap-x snap-mandatory scroll-smooth px-2 lg:px-0"
                >
                  <TabsTrigger
                    value="basics"
                    className="justify-start px-4 py-3 min-h-[44px] lg:min-h-0 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors flex-shrink-0 lg:flex-shrink snap-start scroll-ml-2"
                  >
                    <span className="whitespace-nowrap text-sm">Basics</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="checkout"
                    className="justify-start px-4 py-3 min-h-[44px] lg:min-h-0 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors flex-shrink-0 lg:flex-shrink snap-start scroll-ml-2"
                  >
                    <span className="whitespace-nowrap text-sm">Checkout</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="policies"
                    className="justify-start px-4 py-3 min-h-[44px] lg:min-h-0 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors flex-shrink-0 lg:flex-shrink snap-start scroll-ml-2"
                  >
                    <span className="whitespace-nowrap text-sm">Policies</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            <TabsContent value="basics" className="mt-0">
              <PageCard title="Basics" description="The essentials customers see.">
                <BasicsSection form={form} mode={mode} />
                <div className="mt-6">
                  <StoreImageUploadSection logo={logo} setLogo={setLogo} />
                </div>
              </PageCard>
            </TabsContent>

            <TabsContent value="checkout" className="mt-0">
              <PageCard title="Checkout" description="Payments, shipping, and currency.">
                <CheckoutSection form={form} mode={mode} />
              </PageCard>
            </TabsContent>

            <TabsContent value="policies" className="mt-0">
              <PageCard title="Policies" description="What customers agree to when they buy.">
                <PoliciesSection form={form} mode={mode} />
              </PageCard>
            </TabsContent>
          </div>
        </Tabs>
      </form>
    </div>
  );
}
