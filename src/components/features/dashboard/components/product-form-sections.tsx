"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategorySelector } from "@/components/ui/category-selector";
import { TagSelector } from "@/components/ui/tag-selector";
import { ProductFormValues } from "@/lib/validations/product-form";
import { PRODUCT_TYPE_OPTIONS, PRODUCT_STATUS_OPTIONS } from "@/lib/constants/product";

interface ProductFormSectionsProps {
  form: import("react-hook-form").UseFormReturn<ProductFormValues>;
  storeSlug: string;
}

export const BasicInformationSection = ({ form }: ProductFormSectionsProps) => (
  <section className="space-y-6">
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          placeholder="Premium Mug"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>
        <Input
          id="sku"
          placeholder="SKU-001"
          {...form.register("sku")}
        />
        {form.formState.errors.sku && (
          <p className="text-sm text-destructive">
            {form.formState.errors.sku.message}
          </p>
        )}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="shortDescription">Short Description</Label>
        <Textarea
          id="shortDescription"
          rows={2}
          placeholder="A concise overview for quick scans."
          {...form.register("shortDescription")}
        />
        {form.formState.errors.shortDescription && (
          <p className="text-sm text-destructive">
            {form.formState.errors.shortDescription.message}
          </p>
        )}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          rows={5}
          placeholder="Describe how this product delights your customers."
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>
    </div>
  </section>
);

export const ProductDetailsSection = ({ form }: ProductFormSectionsProps) => (
  <section className="space-y-6">
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Product Type *</Label>
        <Controller
          control={form.control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.type && (
          <p className="text-sm text-destructive">
            {form.formState.errors.type.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Status *</Label>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Select
              value={field.value ?? "draft"}
              onValueChange={(value) => {
                field.onChange(value ?? "draft");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.status && (
          <p className="text-sm text-destructive">
            {form.formState.errors.status.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="29.99"
          {...form.register("price", { valueAsNumber: true })}
        />
        {form.formState.errors.price && (
          <p className="text-sm text-destructive">
            {form.formState.errors.price.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="compareAtPrice">Compare at Price</Label>
        <Input
          id="compareAtPrice"
          type="number"
          step="0.01"
          min="0"
          placeholder="39.99"
          {...form.register("compareAtPrice", { valueAsNumber: true })}
        />
        {form.formState.errors.compareAtPrice && (
          <p className="text-sm text-destructive">
            {form.formState.errors.compareAtPrice.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Inventory *</Label>
        <Input
          id="quantity"
          type="number"
          min="0"
          placeholder="10"
          {...form.register("quantity", { valueAsNumber: true })}
        />
        {form.formState.errors.quantity && (
          <p className="text-sm text-destructive">
            {form.formState.errors.quantity.message}
          </p>
        )}
      </div>
    </div>
  </section>
);

export const CategoriesAndTagsSection = ({ form, storeSlug }: ProductFormSectionsProps) => {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Categories & Tags</h3>
        <p className="text-sm text-muted-foreground">
          Organize your product with categories and tags
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Categories</Label>
          <Controller
            name="categories"
            control={form.control}
            render={({ field }) => (
              <CategorySelector
                value={field.value || []}
                onChange={field.onChange}
                storeSlug={storeSlug}
                disabled={form.formState.isSubmitting}
                placeholder="Select categories..."
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <Controller
            name="tags"
            control={form.control}
            render={({ field }) => (
              <TagSelector
                value={field.value || []}
                onChange={field.onChange}
                storeSlug={storeSlug}
                disabled={form.formState.isSubmitting}
                placeholder="Select tags..."
              />
            )}
          />
        </div>
      </div>
    </section>
  );
};
