import { z } from "zod";
import { MIN_NAME_LENGTH, MIN_DESCRIPTION_LENGTH } from "@/lib/constants/product";

export const productFormSchema = z.object({
  name: z.string().min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters`),
  description: z.string().min(MIN_DESCRIPTION_LENGTH, `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`),
  shortDescription: z.string().optional(),
  sku: z.string().optional(),
  type: z.enum(["physical", "digital", "service"]),
  status: z.enum(["draft", "active", "inactive", "out_of_stock"]),
  price: z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price must be positive"),
  compareAtPrice: z.number({ invalid_type_error: "Compare at price must be a number" }).min(0, "Compare at price must be positive").optional(),
  quantity: z.number({ invalid_type_error: "Quantity must be a number" }).min(0, "Quantity must be positive"),
  requiresShipping: z.boolean(),
  taxable: z.boolean(),
  trackQuantity: z.boolean(),
  allowBackorder: z.boolean(),
  featured: z.boolean(),
  categories: z.array(z.string().min(1, "Category cannot be empty")).optional(),
  tags: z.array(z.string().min(1, "Tag cannot be empty")).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
