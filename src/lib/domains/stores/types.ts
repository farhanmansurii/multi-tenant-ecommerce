import type { stores } from "@/lib/db/schema/core/stores";
export type StoreBusinessType = 'individual' | 'business' | 'nonprofit';

export interface StoreShippingRate {
  name: string;
  price: number;
  estimatedDays: string;
}

type StoreRow = typeof stores.$inferSelect;
type PersistedStoreSettings = NonNullable<StoreRow["settings"]>;

export type StoreSettings = Partial<PersistedStoreSettings> & {
  storefrontContentMode?: 'defaults' | 'store' | 'custom';
  storefrontContent?: Record<string, unknown>;
  // Draft content is used for dashboard preview + staged publishing.
  storefrontDraftContent?: Record<string, unknown>;
  storefrontDraftMode?: 'defaults' | 'store' | 'custom';
  storefrontDraftUpdatedAt?: string;
};

export type StoreData = Omit<StoreRow, "settings" | "createdAt" | "updatedAt"> & {
  codEnabled: boolean;
  productCount: number;
  paymentMethods: Array<'stripe' | 'cod'>;
  shippingEnabled: boolean;
  freeShippingThreshold?: string | number | null;
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  settings?: StoreSettings | null;
  createdAt: string;
  updatedAt: string;
  currentUserRole?: 'owner' | 'admin' | 'member' | 'customer' | null;
};

export interface StoreFormPayload {
  storeName: string;
  storeSlug: string;
  description: string;
  email: string;
  logo?: string;
  primaryColor: string;
  currency: string;
  paymentMethods: Array<'stripe' | 'cod'>;
  codEnabled: boolean;
  shippingEnabled: boolean;
  freeShippingThreshold?: number;
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  status: 'draft' | 'active' | 'suspended';
  featured: boolean;
}
