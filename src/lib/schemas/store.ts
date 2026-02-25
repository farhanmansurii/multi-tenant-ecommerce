import { z } from "zod";

export const storeSettingsSchema = z.object({
  storefrontContentMode: z.string().optional(),
  storefrontContent: z.string().optional(),
  storefrontDraftMode: z.boolean().optional(),
  storefrontDraftContent: z.string().optional(),
  storefrontDraftUpdatedAt: z.string().optional(),
  paymentMethods: z.array(z.enum(["stripe", "cod"])).optional(),
  codEnabled: z.boolean().optional(),
  shippingEnabled: z.boolean().optional(),
  freeShippingThreshold: z.number().nonnegative().optional(),
  termsOfService: z.string().min(10).optional(),
  privacyPolicy: z.string().min(10).optional(),
  refundPolicy: z.string().min(10).optional(),
});

export const updateCheckoutSettingsBodySchema = z
  .object({
    paymentMethods: z.array(z.enum(["stripe", "cod"])).min(1).optional(),
    codEnabled: z.boolean().optional(),
    shippingEnabled: z.boolean().optional(),
    freeShippingThreshold: z.number().nonnegative().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one checkout setting is required",
  });

export const updatePoliciesSettingsBodySchema = z
  .object({
    termsOfService: z.string().max(10000).optional(),
    privacyPolicy: z.string().max(10000).optional(),
    refundPolicy: z.string().max(10000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one policy setting is required",
  });

export const updateBrandSettingsBodySchema = z
  .object({
    storeName: z.string().min(2).max(50).optional(),
    description: z.string().min(10).max(500).optional(),
    email: z.string().email().optional(),
    logo: z.string().nullable().optional(),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    currency: z.string().min(3).max(3).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one brand setting is required",
  });

export const updateStorefrontSettingsBodySchema = z
  .object({
    storefrontContentMode: z.enum(["defaults", "store", "custom"]).optional(),
    storefrontContent: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one storefront setting is required",
  });

export const updateDangerSettingsBodySchema = z.object({
  action: z.enum(["suspend", "activate"]),
});

export const updateStoreBodySchema = z
  .object({
    storeName: z.string().min(2).max(50).optional(),
    storeSlug: z
      .string()
      .min(2)
      .max(30)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    description: z.string().min(10).max(500).optional(),
    email: z.string().email().optional(),
    logo: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    currency: z.string().min(3).optional(),
  })
  .merge(storeSettingsSchema);

export const addStoreMemberBodySchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "member"]).default("member"),
});

export const updateStoreMemberRoleBodySchema = z.object({
  role: z.enum(["admin", "member"]),
});

export type UpdateStoreBody = z.infer<typeof updateStoreBodySchema>;
export type UpdateCheckoutSettingsBody = z.infer<typeof updateCheckoutSettingsBodySchema>;
export type UpdatePoliciesSettingsBody = z.infer<typeof updatePoliciesSettingsBodySchema>;
export type UpdateBrandSettingsBody = z.infer<typeof updateBrandSettingsBodySchema>;
export type UpdateStorefrontSettingsBody = z.infer<typeof updateStorefrontSettingsBodySchema>;
export type UpdateDangerSettingsBody = z.infer<typeof updateDangerSettingsBodySchema>;
export type AddStoreMemberBody = z.infer<typeof addStoreMemberBodySchema>;
export type UpdateStoreMemberRoleBody = z.infer<typeof updateStoreMemberRoleBodySchema>;
