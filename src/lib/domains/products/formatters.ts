import { ProductFormValues } from "@/lib/validations/product-form";
import { UploadedFile } from "@/lib/types/product";

// Utility functions
export const parseNumberOrUndefined = (value: string | null | undefined): number | undefined => {
  if (!value || value === "") return undefined;
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
};

export const formatProductFormData = (values: ProductFormValues, uploadedFiles: UploadedFile[]) => ({
  name: values.name,
  description: values.description,
  shortDescription: values.shortDescription || null,
  sku: values.sku || null,
  type: values.type,
  status: values.status,
  price: values.price.toString(),
  compareAtPrice: values.compareAtPrice?.toString(),
  quantity: values.quantity.toString(),
  trackQuantity: values.trackQuantity,
  allowBackorder: values.allowBackorder,
  requiresShipping: values.requiresShipping,
  taxable: values.taxable,
  featured: values.featured,
      categories: values.categories || [],
      tags: values.tags || [],
  images: uploadedFiles.map((file, index) => ({
    id: `img-${Date.now()}-${index}`,
    url: file.url,
    alt: file.name,
    isPrimary: index === 0, // First image is primary
  })),
});
