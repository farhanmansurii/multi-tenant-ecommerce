"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Package2Icon } from "lucide-react";
import type React from "react";

import { useProductForm } from "@/hooks/use-product-form";
import { ProductFormValues } from "@/lib/validations/product-form";
import { Button } from "@/components/ui/button";
import { PageCard } from "@/components/shared/layout/page-card";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { LoadingState } from "./components/loading-state";
import { ErrorState } from "./components/error-state";
import { NotFoundState } from "@/components/shared/common/not-found-state";
import { ImageUploadSection } from "./components/image-upload-section";
import { SwitchField } from "./components/switch-field";
import {
  BasicInformationSection,
  ProductDetailsSection,
  CategoriesAndTagsSection,
} from "./components/product-form-sections";
import { DangerZone } from "./components/danger-zone";
import { toast } from "sonner";
import { SubmitHandler } from "react-hook-form";

interface ProductFormProps {
  mode: "create" | "edit";
  storeSlug: string;
  productSlug?: string; // Only required for edit mode
}

export default function ProductForm({
  mode,
  storeSlug,
  productSlug,
}: ProductFormProps) {
  const router = useRouter();

  const {
    // State
    isAuthenticated,
    isPending,
    store,
    product,
    isOwner,
    uploadedFiles,
    setUploadedFiles,

    // Loading states
    storeLoading,
    productLoading,

    // Errors
    storeError,
    productError,

    // Form
    form,
    onSubmit,

    // Mutations
    currentMutation,
    deleteMutation,
    handleDelete,
  } = useProductForm({ mode, storeSlug, productSlug: productSlug || "" });

  // Loading and error states
  if (isPending || storeLoading || (mode === "edit" && productLoading)) {
    return (
      <LoadingState
        message={
          mode === "create"
            ? "Preparing product creation..."
            : "Preparing product details..."
        }
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageCard
          title="Authentication Required"
          description={`You must be logged in to ${mode === "create" ? "create" : "edit"} products.`}
          variant="outlined"
          className="max-w-md"
        >
          <div className="text-center">
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </PageCard>
      </div>
    );
  }

  if (mode === "edit") {
    if (storeError) {
      return (
        <NotFoundState
          title="Store Not Found"
          message={
            storeError instanceof Error
              ? storeError.message
              : "Failed to load store"
          }
          backHref="/dashboard/stores"
          backLabel="Back to Stores"
        />
      );
    }

    if (productError) {
      return (
        <NotFoundState
          title="Product Not Found"
          message={
            productError instanceof Error
              ? productError.message
              : "Failed to load product"
          }
          backHref={`/dashboard/stores/${storeSlug}/products`}
          backLabel="Back to Products"
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

    if (!store || !product) {
      return (
        <NotFoundState
          title="Data Not Found"
          message="Store or product information is not available"
          backHref={`/dashboard/stores/${storeSlug}/products`}
          backLabel="Back to Products"
        />
      );
    }
  }

  const isCreateMode = mode === "create";
  const title = isCreateMode ? "Create New Product" : "Edit Product";
  const description = isCreateMode
    ? "Add a new product to your store and start selling."
    : "Update details to keep your product listing accurate.";
  const submitButtonText = isCreateMode ? "Create Product" : "Save Changes";
  const submitButtonLoadingText = isCreateMode
    ? "Creating Product..."
    : "Saving Changes...";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {!isCreateMode && (
            <DangerZone
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={currentMutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            disabled={currentMutation.isPending}
            className="w-full sm:w-auto"
          >
            {currentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {submitButtonLoadingText}
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </div>

      <form
        id="product-form"
        onSubmit={form.handleSubmit(
          onSubmit as SubmitHandler<ProductFormValues>,
          (errors) => {
            const firstError = Object.values(errors)[0] as any;
            const message =
              firstError?.message ||
              (firstError && "root" in firstError && firstError.root?.message) ||
              "Please fix the highlighted errors before saving.";
            toast.error(message);
          }
        )}
        className="space-y-8"
      >
        <section className="space-y-6">
          <ImageUploadSection
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
        </section>
        <BasicInformationSection form={form} storeSlug={storeSlug} />
        <ProductDetailsSection form={form} storeSlug={storeSlug} />
        <section className="space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <SwitchField
              name="requiresShipping"
              label="Requires Shipping"
              description="Enable for physical goods that ship."
              control={form.control}
            />
            <SwitchField
              name="taxable"
              label="Taxable"
              description="Collect sales tax on this product."
              control={form.control}
            />
            <SwitchField
              name="trackQuantity"
              label="Track Quantity"
              description="Automatically adjust stock as orders close."
              control={form.control}
            />
            <SwitchField
              name="allowBackorder"
              label="Allow Backorders"
              description="Accept orders when inventory hits zero."
              control={form.control}
            />
            <div className="md:col-span-2">
              <SwitchField
                name="featured"
                label="Feature this product"
                description="Highlight in featured sections and landing pages."
                control={form.control}
              />
            </div>
          </div>
        </section>
        <CategoriesAndTagsSection form={form} storeSlug={storeSlug} />
      </form>
    </div>
  );
}
