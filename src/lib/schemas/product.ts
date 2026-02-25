import { z } from "zod";

const numericString = z.union([z.string(), z.number()]).transform((value) => String(value));

export const productImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string(),
  isPrimary: z.boolean(),
});

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const createProductBodySchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(160).optional(),
  description: z.string().min(1),
  shortDescription: z.string().max(320).optional(),
  sku: z.string().optional(),
  type: z.enum(["physical", "digital", "service"]).optional(),
  status: z.enum(["draft", "active", "inactive", "out_of_stock"]).optional(),
  price: numericString,
  compareAtPrice: numericString.optional(),
  costPrice: numericString.optional(),
  trackQuantity: z.boolean().optional(),
  quantity: numericString.optional(),
  allowBackorder: z.boolean().optional(),
  weight: numericString.optional(),
  length: numericString.optional(),
  width: numericString.optional(),
  height: numericString.optional(),
  downloadUrl: z.string().url().optional(),
  downloadExpiry: numericString.optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  images: z.array(productImageSchema).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  requiresShipping: z.boolean().optional(),
  taxable: z.boolean().optional(),
});

export const updateProductBodySchema = createProductBodySchema.partial();

export const aiCopySuggestionBodySchema = z.object({
  targetAudience: z.string().min(1).default("general consumers"),
});

export const aiCopyApplyBodySchema = z.object({
  improvedDescription: z.string().min(1),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type CreateProductBody = z.infer<typeof createProductBodySchema>;
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>;
export type AiCopySuggestionBody = z.infer<typeof aiCopySuggestionBodySchema>;
export type AiCopyApplyBody = z.infer<typeof aiCopyApplyBodySchema>;
