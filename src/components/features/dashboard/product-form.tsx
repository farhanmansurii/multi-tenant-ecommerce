"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Package2Icon } from "lucide-react";

import { useProductForm } from "@/hooks/use-product-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { LoadingState } from "./components/loading-state";
import { ErrorState } from "./components/error-state";
import { ImageUploadSection } from "./components/image-upload-section";
import { SwitchField } from "./components/switch-field";
import {
  BasicInformationSection,
  ProductDetailsSection,
  CategoriesAndTagsSection,
} from "./components/product-form-sections";
import { DangerZone } from "./components/danger-zone";

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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-center">
              You must be logged in to {mode === "create" ? "create" : "edit"}{" "}
              products.
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

    if (productError) {
      return (
        <ErrorState
          title="Product Not Found"
          message={
            productError instanceof Error
              ? productError.message
              : "Failed to load product"
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

    if (!store || !product) {
      return (
        <ErrorState
          title="Data Not Found"
          message="Store or product information is not available"
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
    <DashboardLayout
      title={title}
      desc={description}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Stores", href: "/dashboard" },
        { label: store?.name || "Store", href: "/dashboard" },
        { label: "Products", href: "/products" },
        {
          label: isCreateMode ? "New Product" : product?.name || "Edit Product",
        },
      ]}
      icon={Package2Icon}
      headerActions={
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={currentMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            disabled={currentMutation.isPending}
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
      }
    >
      <Card>
        <CardContent className="p-6">
          <form
            id="product-form"
            onSubmit={form.handleSubmit(onSubmit)}
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
              <div className="grid gap-4 md:grid-cols-2">
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
        </CardContent>
      </Card>


      {!isCreateMode && (
        <DangerZone
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </DashboardLayout>
  );
}
