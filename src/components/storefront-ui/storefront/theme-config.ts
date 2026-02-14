import type { StoreData } from "@/lib/domains/stores/types";
import { resolveStorefrontContent, type StorefrontContent } from "./storefront-content";

export type StorefrontThemeConfig = {
  name: string;
  slug: string;
  logoUrl?: string | null;
  currency: string;
  accentColor: string;
  content: StorefrontContent;
  contactEmail?: string;
  shippingEnabled: boolean;
  freeShippingThreshold?: number | null;
  paymentMethods: Array<'stripe' | 'cod'>;
  codEnabled: boolean;
  termsOfService?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
};

export function toStorefrontThemeConfig(store: StoreData): StorefrontThemeConfig {
  const settings = store.settings || {};
  const freeShippingThreshold =
    typeof settings.freeShippingThreshold === "number"
      ? settings.freeShippingThreshold
      : typeof store.freeShippingThreshold === "number"
        ? Number(store.freeShippingThreshold)
        : null;

  const paymentMethods =
    (settings.paymentMethods && settings.paymentMethods.length
      ? settings.paymentMethods
      : store.paymentMethods) || [];

  return {
    name: store.name,
    slug: store.slug,
    logoUrl: store.logo ?? null,
    currency: store.currency || "USD",
    accentColor: store.primaryColor || "#10b981",
    content: resolveStorefrontContent(store),
    contactEmail: store.contactEmail,
    shippingEnabled:
      typeof settings.shippingEnabled === "boolean"
        ? settings.shippingEnabled
        : typeof store.shippingEnabled === "boolean"
          ? store.shippingEnabled
          : false,
    freeShippingThreshold,
    paymentMethods,
    codEnabled:
      typeof settings.codEnabled === "boolean"
        ? settings.codEnabled
        : typeof store.codEnabled === "boolean"
          ? store.codEnabled
          : false,
    termsOfService: settings.termsOfService ?? store.termsOfService ?? "",
    privacyPolicy: settings.privacyPolicy ?? store.privacyPolicy ?? "",
    refundPolicy: settings.refundPolicy ?? store.refundPolicy ?? "",
  };
}
