
export type StoreBusinessType = 'individual' | 'business' | 'nonprofit';

export interface StoreShippingRate {
  name: string;
  price: number;
  estimatedDays: string;
}

export interface StoreSettings {
  storefrontContentMode?: 'defaults' | 'store' | 'custom';
  storefrontContent?: Record<string, unknown>;
  // Draft content is used for dashboard preview + staged publishing.
  storefrontDraftContent?: Record<string, unknown>;
  storefrontDraftMode?: 'defaults' | 'store' | 'custom';
  storefrontDraftUpdatedAt?: string;
  paymentMethods?: Array<'stripe' | 'cod'>;
  codEnabled?: boolean;
  shippingEnabled?: boolean;
  freeShippingThreshold?: number | null;
  termsOfService?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
}

export interface StoreData {
  codEnabled: boolean;
  productCount: number;
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  description: string;
  contactEmail: string;
  primaryColor: string;
  currency: string;
  paymentMethods: Array<'stripe' | 'cod'>;
  shippingEnabled: boolean;
  freeShippingThreshold?: string | number | null;
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  status: 'draft' | 'active' | 'suspended';
  featured: boolean;
  logo?: string | null;
  settings?: StoreSettings | null;
  createdAt: string;
  updatedAt: string;
  currentUserRole?: 'owner' | 'admin' | 'member' | 'customer' | null;
}

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
