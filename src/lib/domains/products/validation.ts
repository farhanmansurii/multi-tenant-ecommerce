// lib/validations/product.ts
import * as z from "zod";

export const productSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  shortDescription: z.string().max(160).optional(),
  price: z.coerce.number().min(0),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().url()).min(1),
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormData = z.output<typeof productSchema>;
