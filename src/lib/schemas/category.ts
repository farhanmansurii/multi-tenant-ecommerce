import { z } from "zod";

export const createCategoryBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
});

export const updateCategoryBodySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
});

export const deleteCategoryQuerySchema = z.object({
  id: z.string().min(1),
});

export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;
export type DeleteCategoryQuery = z.infer<typeof deleteCategoryQuerySchema>;
